import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import io from "socket.io-client";

const Room = () => {
    const { roomID } = useParams();
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
            userVideo.current.srcObject = stream;
            userStream.current = stream;

            socketRef.current = io.connect("/");
            socketRef.current.emit("join room", roomID);

            socketRef.current.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleRecieveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        });

    }, [roomID]); // Ensure useEffect runs when roomID changes

    function callUser(userID) {
        peerRef.current = new Peer(undefined, {
            host: '0.peerjs.com',
            port: 443,
            secure: true
        });

        peerRef.current.on('open', () => {
            const call = peerRef.current.call(userID, userStream.current);
            call.on('stream', (remoteStream) => {
                partnerVideo.current.srcObject = remoteStream;
            });
        });
    }

    function handleRecieveCall(incomingCall) {
        peerRef.current = new Peer(undefined, {
            host: '0.peerjs.com',
            port: 443,
            secure: true
        });

        peerRef.current.on('open', () => {
            const call = peerRef.current.answer(incomingCall);
            call.on('stream', (remoteStream) => {
                partnerVideo.current.srcObject = remoteStream;
            });
        });
    }

    function handleAnswer(answer) {
        peerRef.current.signal(answer);
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    return (
        <div>
            <video autoPlay ref={userVideo} />
            <video autoPlay ref={partnerVideo} />
        </div>
    );
};

export default Room;
