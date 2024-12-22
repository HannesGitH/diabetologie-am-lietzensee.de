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
      packages = forAllSystems (s: with spkgs s; {

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
