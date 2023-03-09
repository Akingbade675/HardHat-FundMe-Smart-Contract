// SPDX-License-Identifier: MIT
// Style Guide
// Pragma
pragma solidity ^0.8.0;
// Imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// import "hardhat/console.sol";
// Error Codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Abdulbasit Akingbade
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private immutable i_priceFeed;

    // Events
    event Funded(address indexed funder, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        // require(i_owner == msg.sender, "Sender is not the owner");
        if (i_owner != msg.sender) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    // 1. constructor
    // 2. external functions
    // 3. public functions
    // 4. internal functions
    // 5. private functions
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure
    constructor(address i_priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(i_priceFeedAddress);
    }

    // // solidity magic function that gets called when a user sends ether to
    // //      the contract adderss without calling the fund function
    // // receive function is called when the data parameter is empty
    // receive() external payable {
    //     fund();
    // }

    // // solidity magic function that gets called when a user sends ether to
    // //      the contract adderss without calling the fund function
    // // fallback function is called when the data parameter is not empty
    // fallback() external payable {
    //     fund();
    // }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(i_priceFeed) >= MINIMUM_USD,
            "You need to send more ETH"
        );
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
        emit Funded(msg.sender, msg.value);
    }

    function withdraw() public onlyOwner {
        for (uint256 index = 0; index < s_funders.length; index++) {
            address funder = s_funders[index];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        // Send the coin from the contract address wallet to the person's calling this function
        // Can use transfer, send or call
        (bool onSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(onSuccess, "Transfer failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        // Note: mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        // Send the coin from the contract address wallet to the person's calling this function
        // Can use transfer, send or call
        (bool onSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(onSuccess, "Transfer failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 fundersIndex) public view returns (address) {
        return s_funders[fundersIndex];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
