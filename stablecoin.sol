// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000 * 10 ** 6);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint amount) public {
        _burn(from, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

}