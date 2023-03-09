import { useEffect, useState } from 'react';
import socket from './socket'

function App(){
  
  const [username, setUsername] = useState("");
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [usersdb, setUsersdb] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState("")
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    socket.on('users', (users) => {

      users.forEach((user) => {
        user.self = user.userID === socket.id;
        
      });
      // put the current user first, and then sort by username
      users = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      setUsersdb(users)
    })

    socket.on('user connected', (user) => {
      console.log("new user")
      console.log(user)
      setUsersdb((users) => (
        [...users, user] 
      ))
    })

    socket.on('private message', ({message, from}) => {
      usersdb.forEach((user) => {
        if(user.userid === from ) {
          if(user.messages) user.messages.push(message)
          else {
            user.messages = [message]
          }
        }
      })
      setMessageCount(messageCount+1)
    })

    return () => {
      socket.off('users');
      socket.off('user connected');
      socket.off('private message')
    }
  }, [isConnected, usersdb, messageCount])

  function handleClick(){
    setUsernameAlreadySelected(true)
    socket.auth = { username }
    socket.connect();
    socket.on('connect', () => {
      setIsConnected(true)
    })
  }

  function sendMessage(){
    if(selectedUser) {
      socket.emit('private message', {
        message,
        to: selectedUser.userid,
      })

      if(selectedUser.messages) selectedUser.messages.push(message)
      else {
        selectedUser.messages = [message]
      }

      setMessageCount(messageCount + 1)
    }
  }

  return (
    <div>
      <h3>Current User is {username}</h3>
      {!usernameAlreadySelected && (
        <div>
          <input type="text" onChange={(e) => setUsername(e.target.value)} />
          <button onClick={handleClick}>Click</button>
        </div>
      )}

      {usernameAlreadySelected && (
        <div>
          <div>
            <input type="text" onChange={(e) => setMessage(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
          </div>
          {
            usersdb.map((user) => {
              return <div onClick={() => setSelectedUser(user)}>{user.username}</div>
            })
          }
        </div>
      )}

      {isConnected && <div>{"connected"}</div>}
      {!isConnected && <div>{"not connected"}</div>}

      <div>messages  {messageCount}</div>

      {selectedUser && <p>Messages from {selectedUser.username}</p>}
      
      {(selectedUser && selectedUser.messages) && (
        <div>
          {selectedUser.messages.map(msg => (
            <li>{msg}</li>
          ))}
        </div>
      )}
    </div>
  )
}

export default App;