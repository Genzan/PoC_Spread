/*
  Author: Escudero Caporal Alan Enrique
  Date: 20/Junio/2022
  Version: 0.0.1
*/
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

/// @title POC Contract of the functions requiered to interchange files and request Searches
/// @author Escudero Caporal Alan Enrique
/// @notice This contract contains limited functionability
/// @dev Pending to implement upgradability
contract POC {

  //Errors
  error SearchAlreadyExistError(string _uuid);
  error SearchDontExistError(string _uuid);
  error SearchIsClosedError(string uuid);

  //Structs used
  struct Search {
    string curp;
    string cid;
    uint32 finalScore;
    bool closed;
    Response[] Responses;
  }

  struct Response {
    address node;
    bool found;
    string cid;
  }

  //State Variables
  address private contractOwner;
  uint16 private requiredResponses;
  mapping (string => Search) internal Searches;

  //Events
  event SearchAdded(string _uuid, string _curp, string _cid);
  event ResultAdded(string _uuid, address _node);
  event SearchClosed(string _uuid, string _curp);

  //Modifiers
  modifier onlyOwner() {
    require(contractOwner == msg.sender, "not owner");
    _;
  }

  constructor(uint16 _requiredResponses) {
    contractOwner = msg.sender;
    requiredResponses = _requiredResponses;
  }
  
  function newSearch(string memory _uuid, string memory _curp, string memory _cid) external {
    if(bytes(Searches[_uuid].curp).length == 0) {
      revert SearchAlreadyExistError(_uuid);
    }
    Searches[_uuid].curp = _curp;
    Searches[_uuid].cid = _cid;
    emit SearchAdded(_uuid, _curp, _cid);
  }

  function newResult(string memory _uuid, bool _found, string memory _cid) external {
    if(!isOpen(_uuid)) {
      revert SearchIsClosedError(_uuid);
    }
    if(bytes(Searches[_uuid].curp).length != 0) {
      revert SearchDontExistError(_uuid);
    }
    Searches[_uuid].Responses.push(Response(msg.sender, _found, _cid));
    checkforClose(_uuid);
    emit ResultAdded(_uuid, msg.sender);
  }

  function checkforClose(string memory _uuid) internal {
    if(Searches[_uuid].Responses.length >= requiredResponses) {
      Searches[_uuid].closed = true;
      emit SearchClosed(_uuid, Searches[_uuid].curp);
    }
  }

  function getSearchCID(string memory _uuid) external view returns (string memory) {
    if(bytes(Searches[_uuid].curp).length != 0) {
      revert SearchDontExistError(_uuid);
    }
    return Searches[_uuid].cid;
  }

  function getResults(string memory _uuid) external view returns (Response[] memory) {
    if(bytes(Searches[_uuid].curp).length != 0) {
      revert SearchDontExistError(_uuid);
    }
    return Searches[_uuid].Responses;
  }

  function isOpen(string memory _uuid) public view returns(bool) {
    if(bytes(Searches[_uuid].curp).length != 0) {
      revert SearchDontExistError(_uuid);
    }
    return Searches[_uuid].closed;
  }

  //Metodo para cerrar Busqueda al tener un resultado final

  function changeRequiredResponses(uint16 _requiredResponses) external onlyOwner {
    requiredResponses = _requiredResponses;
  }
  
}