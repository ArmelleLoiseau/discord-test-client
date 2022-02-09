import React, { useState, useRef, useEffect, useContext } from "react";
import apiHandler from "./../../api/apiHandler";
import useAuth from "../../context/useAuth";
import { SocketContext } from "../../context/socket.context";
import "./dashboard-css/Profil.css";

const ProfileDetails = () => {
  // get info from auth context
  const { currentUser, isLoggedIn, removeUser, storeToken, authenticateUser } =
    useAuth();

  // get info from socket context
  const { socket, setUserUpdated, userUpdated } = useContext(SocketContext);

  // use State to handle form input
  const [userToUpdate, setUserToUpdate] = useState({
    _id: "",
    username: "",
    email: "",
    avatar: "",
  });

  // set the editing or delete mode to display different views
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);

  // ****** catch the avatar input for form data (TO FIX) ******
  const avatarRef = useRef();

  // on mount, check the currentUser and get his info from DB
  useEffect(() => {
    if (currentUser) {
      apiHandler
        .get("/user", currentUser._id)
        .then((dbResponse) => {
          setUserToUpdate(dbResponse.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (!isLoggedIn) {
      setUserToUpdate(null);
    }
  }, [isLoggedIn]);

  // switch to edit mode
  const handleEditMode = (e) => {
    e.preventDefault();
    setIsEditing(true);
  };

  // send the edited form
  const SendForm = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("username", userToUpdate.username);
    fd.append("email", userToUpdate.email);
    fd.append("avatar", avatarRef.current.files[0]);
    console.log("the current avatar ref is :", avatarRef.current.files[0]);
    try {
      const dbResponse = await apiHandler.patch(
        `/user/${userToUpdate._id}`,
        fd,
        {
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      );
      // store new token
      storeToken(dbResponse.data.authToken);
      authenticateUser();

      // change the user info inputs
      setUserToUpdate((prevValue) => dbResponse.data.payload);

      // set the "user updated" to true to trigger the render of the users list
      setUserUpdated(true);

      // switch back to mode "not editing"
      setIsEditing(!isEditing);

      setUserUpdated(false);
    } catch (error) {
      console.error(error);
      // **** TO DO : error message "smg went wrong, please try again"
    }
  };

  // disconnect the user (cut socket connection and remove his token)
  const handleDisconnect = async (e) => {
    e.preventDefault();
    socket.disconnect();
    removeUser();
  };

  // ask user to confirm delete/edit ops
  const confirmDelete = (e) => {
    e.preventDefault();
    setDeleteMode(true);
  };
  const cancelDelete = (e) => {
    e.preventDefault();
    setDeleteMode(false);
    setIsEditing(true);
  };
  const cancelEdit = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  // delete user infos in db + cut socket connection and remove token
  const deleteAccount = async (e) => {
    e.preventDefault();
    try {
      await apiHandler.delete(`/user/${userToUpdate._id}`);
      socket.disconnect();
      removeUser();
      setDeleteMode(false);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!currentUser) return <p>loading</p>;
  return (
    <div>
      {deleteMode && (
        <div className="delete-mode container">
          <p>Are you sure ? This means goodbye... forever</p>
          <button className="profil-btn" onClick={cancelDelete}>
            Nope nope nopity nope
          </button>
          <button className="profil-btn" onClick={deleteAccount}>
            Delete for good
          </button>
        </div>
      )}
      {isEditing && (
        <form className="edit-mode container">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={userToUpdate.username}
            onChange={(e) => {
              setUserToUpdate({ ...userToUpdate, username: e.target.value });
            }}
          />
          <label htmlFor="email">Email</label>
          <input
            type="text"
            id="email"
            value={userToUpdate.email}
            onChange={(e) => {
              setUserToUpdate({ ...userToUpdate, email: e.target.value });
            }}
          />
          <label htmlFor="avatar">avatar</label>
          <input type="file" name="avatar" id="avatar" ref={avatarRef} />
          <button className="profil-btn" onClick={SendForm}>
            Send
          </button>
          <button className="profil-btn" onClick={cancelEdit}>
            {" "}
            Nevermind, this is fine
          </button>
          <button className="profil-btn" onClick={confirmDelete}>
            Delete my account
          </button>
        </form>
      )}
      {!isEditing && (
        <div className="display-mode container">
          <p className="display-mode username">{userToUpdate?.username}</p>
          <p className="display-mode email">{userToUpdate?.email}</p>
          <img
            className="display-mode avatar"
            src={userToUpdate?.avatar}
            alt={userToUpdate?.username}
          />
          <div className="display-mode icons-container">
            <i
              className="fas fa-user-edit display-mode icon"
              onClick={handleEditMode}
            ></i>
            <i
              onClick={handleDisconnect}
              className="fa-solid fa-right-from-bracket display-mode icon"
            ></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
