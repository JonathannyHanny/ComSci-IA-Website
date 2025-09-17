// Filename - App.js

// Importing modules
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    // usestate for setting a javascript
    // object for storing and using data
    const [data, setdata] = useState({
        Test1: "o",
        Test2: "",
        date: "",
        programming: "",
    });

    // Using useEffect for single rendering
    useEffect(() => {
        // Using fetch to fetch the api from 
        // flask server it will be redirected to proxy
        fetch("/data").then((res) =>
            res.json().then((data) => {
                // Setting a data from api
                setdata({
                    Test1: data.Test1,
                    Test2: data.Test2,
                    date: data.Date
                });
            })
        );
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>React and flask</h1>
                {/* Calling a data from setdata for showing */}
                <p>{data.Test1}</p>
                <p>{data.Test2}</p>
                <p>{data.Date}</p>

            </header>
        </div>
    );
}

export default App;
