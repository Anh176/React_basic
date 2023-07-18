import { useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { fetchAllUser } from '../services/UserService';
import { useState } from 'react';
import ReactPaginate from 'react-paginate';
import ModalAdd from './ModalAdd';
import ModalEdit from './ModalEdit';
import ModalConfirm from './ModalConfirm';
import { CSVLink, CSVDownload } from "react-csv";
import './TableUser.scss';
import _, { clone, debounce } from 'lodash';
import Papa from "papaparse"
import { toast } from 'react-toastify';
const TableUsers = (props) => {
    const [listUsers, setListUsers] = useState([]);
    const [TotalUsers, setTotalUsers] = useState(0);
    const [totalPage, setTotalPages] = useState(0);

    const [isShowModal, setIsShowModal] = useState(false);

    const [isShowEdit, setIsShowEdit] = useState(false);
    const [dataUserEdit, setDataUserEdit] = useState({});

    const [isShowModalDelete, setIsShowModalDelete] = useState(false)
    const [dataUserDelete, setDataUserDelete] = useState({});

    const [sortBy, setSortBy] = useState("asc");
    const [sortField, setSortField] = useState("id");

    const [keyWord, setKeyWord] = useState("");
    const [dataExport, setDataExport] = useState([])

    const handleClose = () => {
        setIsShowModal(false);
        setIsShowEdit(false);
        setIsShowModalDelete(false);
    }

    const handleUpdate = (user) => {
        setListUsers([user, ...listUsers])
    }

    const handleDelete = (user) => {
        setDataUserDelete(user);
        console.log(user);
        setIsShowModalDelete(true);
    }

    const handleEditUserFromModal = (user) => {
        let cloneListUsers = _.cloneDeep(listUsers);
        let index = listUsers.findIndex(item => item.id === user.id);
        cloneListUsers[index].first_name = user.first_name;
        setListUsers(cloneListUsers);
    }

    const handleDeletetUserFromModal = (user) => {
        let cloneListUsers = _.cloneDeep(listUsers);
        cloneListUsers = cloneListUsers.filter(item => item.id !== user.id)
        console.log(">>>list user ", cloneListUsers)
        setListUsers(cloneListUsers);
    }



    const handleEdit = (user) => {
        console.log(user)
        setDataUserEdit(user)
        setIsShowEdit(true)
    }

    useEffect(() => {
        //call apis
        getUser(1);
    }, [])
    const getUser = async (page) => {
        let res = await fetchAllUser(page)
        if (res && res.data && res.data) {
            setListUsers(res.data)
            setTotalUsers(res.total)
            setTotalPages(res.total_pages)
        }
    }
    const handlePageClick = (event) => {
        getUser(+event.selected + 1);
    }

    const handleSort = (sortBy, sortField) => {
        setSortBy(sortBy);
        setSortField(sortField);

        let cloneListUsers = _.cloneDeep(listUsers);
        cloneListUsers = _.orderBy(cloneListUsers, [sortField], [sortBy]);
        console.log(cloneListUsers)
        setListUsers(cloneListUsers);
    }

    const handleSearch = debounce((event) => {
        let term = event.target.value;
        console.log(event.target.value)
        if (term) {
            let cloneListUsers = _.cloneDeep(listUsers);
            cloneListUsers = cloneListUsers.filter(item => item.email.includes(term))
            console.log(cloneListUsers)
            setListUsers(cloneListUsers)
        } else {
            getUser(1);
        }
    }, 500)

    const getUserExport = (event, done) => {
        let result = [];
        if (listUsers && listUsers.length > 0) {
            result.push(["Id", "Email", "First Name", "Last Name"])
            listUsers.map((item, index) => {
                let arr = [];
                arr[0] = item.id;
                arr[1] = item.email;
                arr[2] = item.first_name;
                arr[3] = item.last_name;
                result.push(arr);
            })
            setDataExport(result);
            console.log(">>>> ", dataExport)
            done();
        }
    }

    const handleImportCSV = (event) => {
        if (event.target && event.target.files && event.target.files[0]) {

            let file = event.target.files[0];
            if (file.type !== "text/csv") {
                toast.error("Only accept csv file ...")
                return;
            }
            Papa.parse(file, {
                //header : true,
                complete: function (results) {
                    let rawCSV = results.data;
                    console.log("check raw", rawCSV)
                    if (rawCSV.length > 0) {
                        if (rawCSV[0][0] != "id"
                            || rawCSV[0][1] !== "email"
                            || rawCSV[0][2] !== "first_name"
                            || rawCSV[0][3] !== "last_name"
                        ) {
                            toast.error("Wrong format Header !!!!")
                            return;
                        }
                        if (rawCSV[0] && rawCSV[0].length === 4) {
                            let result = [];
                            rawCSV.map((item, index) => {
                                if (index > 0 && item.length > 1) {
                                    let obj = {};
                                    obj.id = item[0]
                                    obj.email = item[1]
                                    obj.first_name = item[2]
                                    obj.last_name = item[3]
                                    result.push(obj)
                                }
                            })
                            setListUsers(result);
                            console.log("checkresult", result)
                        }
                    } else {
                        toast.error("Not found data on CSV file!")
                    }
                }
            });
        }
    }
    return (<>
        <div className='my-3 add-new'>
            <span><b>ListUser:</b></span>
            <div className="group-buttons">
                <label htmlFor="upload" className='btn btn-warning'>
                    <i className="fa-solid fa-file-import"></i>Import
                </label>
                <input id="upload" type="file" hidden
                    onChange={(event) => handleImportCSV(event)} />
                <CSVLink
                    filename={"Users.csv"}
                    className="btn btn-primary"
                    data={dataExport}
                    asyncOnClick={true}
                    onClick={getUserExport}
                ><i className="fa-sharp fa-solid fa-file-arrow-down"></i> Export</CSVLink>
                <button display className='btn btn-success' onClick={() => setIsShowModal(true)}>Add new user</button>
            </div>
        </div>
        <div className='col-4 my-3'>
            <input
                className='form-control'
                placeholder='Search user by email ... '
                //value={keyWord}
                onChange={(event) => handleSearch(event)}></input>
        </div>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th >
                        <div className='sort-header'>
                            <span>ID</span>
                            <span>
                                <i className='fa-solid fa-arrow-down-long'
                                    onClick={() => handleSort("desc", "id")}></i>
                                <i className='fa-solid fa-arrow-up-long'
                                    onClick={() => handleSort("asc", "id")}></i>
                            </span>
                        </div>
                    </th>
                    <th >Email</th>
                    <th>
                        <div className='sort-header'>
                            <span>First Name</span>
                            <span>
                                <i className='fa-solid fa-arrow-down-long'
                                    onClick={() => handleSort("desc", "first_name")}></i>
                                <i className='fa-solid fa-arrow-up-long'
                                    onClick={() => handleSort("asc", "first_name")}></i>
                            </span>
                        </div>
                    </th>
                    <th >Last Name</th>
                    <th >Action</th>
                </tr>
            </thead>
            <tbody>
                {listUsers && listUsers.length > 0 &&
                    listUsers.map((item, index) => {
                        return (
                            <tr key={`users-${index}`}>
                                <td>{item.id}</td>
                                <td>{item.email}</td>
                                <td>{item.first_name}</td>
                                <td>{item.last_name}</td>
                                <td>
                                    <button
                                        className="btn btn-warning mx-3"
                                        onClick={() => handleEdit(item)}
                                    >Edit</button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(item)}
                                    >Delete</button>
                                </td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
        <ReactPaginate
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={totalPage}
            previousLabel="< previous"
            pageLinkClassName='page-link'
            pageClassName='page-item'
            previousLinkClassName='page-link'
            previousClassName='page-item'
            nextClassName='page-item'
            nextLinkClassName='page-link'
            containerClassName='pagination'
            activeClassName='active'
            breakLinkClassName='page-link'
            renderOnZeroPageCount={null}
        />
        <ModalAdd
            show={isShowModal}
            handleClose={handleClose}
            handleUpdate={handleUpdate}
        />
        <ModalEdit
            show={isShowEdit}
            dataUserEdit={dataUserEdit}
            handleClose={handleClose}
            handleEditUserFromModal={handleEditUserFromModal}
        />

        <ModalConfirm
            show={isShowModalDelete}
            handleClose={handleClose}
            dataUserDelete={dataUserDelete}
            handleDeletetUserFromModal={handleDeletetUserFromModal}
        />
    </>)
}
export default TableUsers;