{
  description = "The Homepage of Diabetologie am Lietzensee";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
      inherit (nixpkgs) lib;
      systems = lib.systems.flakeExposed;
      forAllSystems = lib.genAttrs systems;
      spkgs = system: nixpkgs.legacyPackages.${system}.pkgs;
    in {
      packages = forAllSystems (s: with spkgs s; rec {
        page = stdenv.mkDerivation (finalAttrs: {
          pname = "astro-page";
          version = "000-0";

          src = ./.;

          nativeBuildInputs = [
            nodejs
            pnpm.configHook
          ];

          pnpmDeps = pnpm.fetchDeps {
            inherit (finalAttrs) pname version src;
            hash = "sha256-EVe7VoGJgNyp4cyScl2P+VUddkOxiYTF7VGnlDoL3SU=";
          };

          buildPhase = ''
            pnpm install
            pnpm build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out
          '';

        });
        default = page;
      });

      devShells = forAllSystems (s: with spkgs s; {
        default = mkShell {
          buildInputs = [
            nodejs
            pnpm
          ];
        };
      });
  };
}
