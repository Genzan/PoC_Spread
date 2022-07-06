/*
  Author: Escudero Caporal Alan Enrique
  Date: 08/Junio/2022
  Version: 0.0.2
*/
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract Demo {

  //State Variables
  address private contractOwner;
  using Counters for Counters.Counter;
  Counters.Counter private _Ids;
  mapping (string => string[]) internal Atestaciones;
  mapping (uint256 => string) internal Busqueda;

  //Events
  event AtestacionAdded(uint256 _id, string _curp, string _playground);

  constructor() public {
    contractOwner = msg.sender;
  }
  
  function Atestacion(string memory _curp, string memory _playground) external{
    _Ids.increment();
    uint256 newItemId = _Ids.current();
    Atestaciones[_curp].push(_playground);
    Busqueda[newItemId] = _playground;
    emit AtestacionAdded(newItemId, _curp, _playground);
  }

  function SearchByCurp(string memory _curp) external view returns (string[] memory){
    return (Atestaciones[_curp]);
  }

  function SearchByID(uint256 _id) external view returns (string memory){
    return (Busqueda[_id]);
  }
  
}