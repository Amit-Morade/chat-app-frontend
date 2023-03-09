import { useEffect, useState } from "react"
import socket from "../socket"

export default function Chat({users}){

    const [selectedUser, setSelectedUser] = useState("");
    const [message, setMessage] = useState("")

    function handleClick(user){
        setSelectedUser(user)
        console.log(user)
    }

    function sendMessage(){
        if(selectedUser) {
            socket.emit("private message", {
                message,
                to: selectedUser.userid
            })

            if(!selectedUser.messages){
                selectedUser.messages = []
            }
            selectedUser.messages.push({
                message,
                fromSelf:  true,
            })

            console.log("hehehe")
            console.log(selectedUser.messages)
            setMessage("")
        }


    }

    return (
        <>
            { users.map((user) => (
                <div onClick={() => handleClick(user)}>{user.userid + "  " + user.username}</div>
            )) }

            <input type="text" value={message} onChange={(event) => {
                setMessage(event.target.value)
            }} />
            <button onClick={sendMessage}>Submit</button>

            {
                (selectedUser && selectedUser.messages.length!==0) && (
                    <>
                    {
                        selectedUser.messages.map((msg) => {
                            return (
                                <li>
                                    {msg.message}
                                </li>
                            )
                        })
                    }
                        
                    </>
                )
            }
        </>
    )
}