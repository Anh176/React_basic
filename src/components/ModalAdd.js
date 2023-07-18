import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { postCreateUser } from "../services/UserService"
import { toast } from 'react-toastify';
const ModalAdd = (props) => {
  const { show, handleClose, handleUpdate } = props;
  const [name, setName] = useState("")
  const [job, setJob] = useState("")
  const handleSaveUser = async () => {
    let res = await postCreateUser(name, job);
    console.log(">>> check res:", res)
    if (res && res.id) {
      handleClose();
      setName('');
      setJob('');
      toast.success("A User is created succeed")
      handleUpdate({ first_name: name, id: res })
    } else {
      toast.error("An error")
    }
  }
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
        <div classsName='body-add-new'>
          <div class="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control"
              value={name}
              onChange={(event) => setName(event.target.value)} >
            </input>
          </div>
          <div class="mb-3">
            <label className="form-label">Job</label>
            <input type="text" className="form-control"
              value={job}
              onChange={(event) => setJob(event.target.value)} >
            </input>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveUser}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalAdd;