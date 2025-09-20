// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "./PriceConverter.sol";

error FundMe_NotOwner();

contract FundMe {
    //state declaration
    using PriceConverter for uint256;

    //state variable

    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe_NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function sendFunds(
        address payable _receiver,
        uint256 _amount
    ) public onlyOwner {
        require(address(this).balance >= _amount, "Not enough balance");
        _receiver.transfer(_amount);
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    ////////////////
    // Add to your FundMe contract
function purchaseTokens(address payable adminAddress) public payable {
    require(msg.value > 0, "Must send some ETH");
    require(adminAddress != address(0), "Invalid admin address");
    
    // Transfer ETH to admin
    (bool success, ) = adminAddress.call{value: msg.value}("");
    require(success, "Transfer failed");
    
    // Emit event for the frontend
    emit TokensPurchased(msg.sender, msg.value, block.timestamp);
}

// Add this event definition with other events
event TokensPurchased(address indexed buyer, uint256 amount, uint256 timestamp);



    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // function getOwner() public view returns (address) {
    //     return i_owner;
    // }

    // function getFunders(uint256 index) public view returns (address) {
    //     return s_funders[index];
    // }

    // function getAddressToAmountFunded(
    //     address funder
    // ) public view returns (uint256) {
    //     return s_addressToAmountFunded[funder];
    // }

    // function getPriceFeed() public view returns (AggregatorV3Interface) {
    //     return s_priceFeed;
    // }
}
