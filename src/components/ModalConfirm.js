import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { deleteUser } from '../services/UserService'
import { toast } from 'react-toastify';
const ModalConfirm = (props) => {
  const { show, handleClose, dataUserDelete, handleDeletetUserFromModal } = props;

  const confirmDelete = async() => {
    // Logic xác nhận xóa người dùng
    let res = await deleteUser(dataUserDelete.id)
    if(res && +res.statusCode === 204)
    {
      toast.success("Delete user succeed")
      handleClose();
      handleDeletetUserFromModal(dataUserDelete);
    }
    else{
      toast.error("error delete user")
    }
    console.log(">> check res", res)
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="body-add-new">
          This action can't undo
          Do you sure to delete this user <br></br> <b>email = {dataUserDelete.email}</b></div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={confirmDelete}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalConfirm;