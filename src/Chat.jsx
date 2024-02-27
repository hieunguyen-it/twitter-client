import React, { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";

const profile = JSON.parse(localStorage.getItem("profile"));
const usernames = [
  {
    name: "user1",
    value: "HieuNguyen",
  },
  {
    name: "user2",
    value: "user65d5fcb596418cb3cd318e78",
  },
];
export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recevier, setReceiver] = useState("");

  // Get profile user
  const getProfile = (username) => {
    axios
      .get(`/user/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
      })
      .then((res) => {
        setReceiver(res.data.result._id);
        alert(`Now you can chat with ${res.data.result.name}`);
      });
  };
  useEffect(() => {
    // Kết nối socket
    socket.connect();
    console.log("data");
    // Gửi id của user đến sever
    socket.auth = {
      _id: profile._id,
    };
    // Nhận tin nhắn từ server cho người nhận thông qua emit
    // recevier private message từ sever gửi đến client
    socket.on("recevier private message", (data) => {
      console.log("data", data);
      const content = data.content;
      // Lấy nội dung rồi set vào mảng messages
      setMessages((prev) => [
        ...prev,
        {
          content,
          isSender: false,
        },
      ]);
    });

    // Ngắt kết nối socket khi chuyển tab tránh memory leak (tràn bộ nhớ)
    return () => {
      socket.disconnect();
    };
  }, []);

  const send = (e) => {
    e.preventDefault();
    setMessage("");
    // Gửi 1 emit event đến sever và gửi to là người id của người nhận
    console.log("recevier", recevier);
    socket.emit("private message", {
      content: message,
      to: recevier,
    });
    setMessages((messages) => [
      ...messages,
      {
        content: message,
        isSender: true,
      },
    ]);
  };
  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>
              {username.name}
            </button>
          </div>
        ))}
      </div>
      <div className="chat">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="message-container">
              <div
                className={
                  "message" + (message.isSender ? "message-right " : "")
                }
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          type="text"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
