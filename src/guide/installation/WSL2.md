目前需要手動從[官網](https://github.com/nix-community/NixOS-WSL)下載。

# 更新wsl
需要至少2以上的版本，可以用`wsl --version`察看

# 下載檔案
1. 先從 [此網站](https://github.com/nix-community/NixOS-WSL/releases/tag/22.05-5c211b47) 下載 nixos-wsl-installer.tar.gz
2. 將檔案移到希望安裝的位置
3. 開啟Powershell
4. 輸入`wsl --import NixOS .\NixOS\ nixos-wsl-installer.tar.gz --version 2`
5. `wsl -d NixOS` 就能啟動了，第一次啟動會很久

# 遇到`Starting systemd...`
從[此網站](https://github.com/nix-community/NixOS-WSL/releases/tag/22.05-5c211b47)下載nixos-wsl-x86_64-linux.tar.gz
