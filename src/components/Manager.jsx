import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
const Manager = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordsArray, setpasswordsArray] = useState([]);

  const getpasswords = async () => {
    let req = await fetch("http://localhost:3000/");
    let passwords = await req.json();

    console.log(passwords);
    setpasswordsArray(passwords);
  };

  useEffect(() => {
    getpasswords();
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // const savepassword = async () => {
  //   if (
  //     form.site.length > 3 &&
  //     form.username.length > 3 &&
  //     form.password.length > 3
  //   ) {
  //     // If any such id exists in the db, delete it
  //     await fetch("http://localhost:3000/", {
  //       method: "DELETE",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id: form.id }),
  //     });

  //     setpasswordsArray([...passwordsArray, { ...form, id: uuidv4() }]);
  //     await fetch("http://localhost:3000/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...form, id: uuidv4() }),
  //     });

  //     // Otherwise clear the form and show toast
  //     setform({ site: "", username: "", password: "" });
  //     toast("Password saved!", {
  //       position: "top-right",
  //       autoClose: 4000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "light",
  //     });
  //   } else {
  //     toast("Error: Password not saved!");
  //   }
  // };
  const savepassword = async () => {
  if (
    form.site.length > 3 &&
    form.username.length > 3 &&
    form.password.length > 3
  ) {

    const newId = form.id || uuidv4();

    // Delete old entry if editing
    if (form.id) {
      await fetch("http://localhost:3000/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.id }),
      });
    }

    const passwordObj = {
      ...form,
      id: newId,
    };

    // Update frontend state
    setpasswordsArray([...passwordsArray, passwordObj]);

    // Save to backend
    await fetch("http://localhost:3000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordObj),
    });

    // Clear form
    setform({ site: "", username: "", password: "" });

    toast("Password saved!", {
      position: "top-right",
      autoClose: 4000,
      theme: "light",
    });

  } else {
    toast("Error: Password not saved!");
  }
};
  const deletepassword = async (id) => {
    if (confirm("Are you sure you want to delete this password?")) {
      setpasswordsArray(passwordsArray.filter((item) => item.id !== id));
      await fetch(`http://localhost:3000/`, {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      toast("Password deleted successfully!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };
  const editpassword = (id) => {
    setform({ ...passwordsArray.filter((i) => i.id === id)[0], id: id });
    setpasswordsArray(passwordsArray.filter((item) => item.id !== id));
  };

  const copytext = (text) => () => {
    toast("copied to clipboard", {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    navigator.clipboard.writeText(text);
  };

  const handlechange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="absolute inset-0 -z-10 max-h-full w-full items-center px-5 py-24  [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className=" mx-auto bg-blue-200 justify-center max-w-5xl rounded-sm max-h-full ">
        <div className="text-white flex flex-col p-4 justify-center items-center gap-2 pb-5 md:pr-2">
          <h1 className="text-4xl font-bold text-center">
            <span className="text-blue-800"> &lt;</span>
            Pass
            <span className="text-blue-800">Op/ &gt;</span>
          </h1>
          <p className="text-blue-900 font-bold">Your own password manager</p>
          <input
            value={form.site}
            onChange={handlechange}
            placeholder="Enter Website URL"
            className="rounded-lg w-full bg-white text-black  border border-blue-900 p-3 py-1"
            type="text"
            name="site"
            id="site"
          />
          <div className="flex flex-col md:flex-row  gap-4 w-full">
            <input
              value={form.username}
              onChange={handlechange}
              placeholder="Enter Username"
              className="rounded-lg bg-white text-black border border-blue-900 p-3 py-1 w-full"
              type="text"
              name="username"
              id="username"
            />
            <div className="relative">
              <input
                value={form.password}
                onChange={handlechange}
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className="rounded-lg  bg-white text-black border border-blue-900 p-3 py-1 w-full"
                name="password"
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={togglePassword}
              >
                {showPassword ? (
                  <img
                    src="/icons/close%20eye.png"
                    alt="show password"
                    className="h-6 w-6 hover:cursor-pointer top-[-5px]"
                  />
                ) : (
                  <img
                    src="/icons/open%20eye.png"
                    alt="hide password"
                    className="h-6 w-6 hover:cursor-pointer top-[-5px]"
                  />
                )}
              </span>
            </div>
          </div>
          <button
            onClick={savepassword}
            className="text-black text-center font-bold hover:cursor-pointer justify-center bg-blue-300 rounded-lg p-1 px-4 flex gap-2 items-center border-2 border-blue-900 hover:bg-blue-400"
          >
            <lord-icon
              className="hover:cursor-pointer"
              src="https://cdn.lordicon.com/jgnvfzqg.json"
              trigger="hover"
            ></lord-icon>
            Save Password
          </button>
        </div>

        <div className="password flex flex-col p-4 gap-4">
          <h2 className="flex justify-center font-bold">
            Your Saved Passwords{" "}
          </h2>
          {passwordsArray.length === 0 && (
            <div className="flex justify-center text-blue-900 font-bold">
              No passwords saved yet.
            </div>
          )}
          {passwordsArray.length > 0 && (
            <table className="table-auto w-full overflow-hidden rounded-md">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="py-1">Site</th>
                  <th className="py-1">Username</th>
                  <th className="py-1">Password</th>
                  <th className="py-1">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-blue-300">
                {passwordsArray.map((item, index) => (
                  <tr key={index}>
                    <td className="py-1 text-center flex items-center justify-center ">
                      <div className=" flex items-center justify-center">
                        <a href={item.site} target="_blank">
                          {" "}
                          {item.site}{" "}
                        </a>

                        <div
                          className="size-6 ml-2 lordiconcopy"
                          onClick={copytext(item.site)}
                        >
                          <lord-icon
                            className="hover:cursor-pointer"
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className="py-1 text-center">
                      <div className="flex items-center justify-center">
                        <span>{item.username}</span>
                        <div
                          className="size-6 ml-2 lordiconcopy"
                          onClick={copytext(item.username)}
                        >
                          <lord-icon
                            className="hover:cursor-pointer"
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>

                    <td className="py-1 text-center ">
                      <div className=" flex items-center justify-center">
                        <span>{"*".repeat(item.password.length)}</span>

                        <div
                          className="size-6 ml-2 lordiconcopy"
                          onClick={copytext(item.password)}
                        >
                          <lord-icon
                            className="hover:cursor-pointer"
                            style={{
                              width: "25px",
                              height: "25px",
                              paddingTop: "3px",
                            }}
                            src="https://cdn.lordicon.com/iykgtsbt.json"
                            trigger="hover"
                          ></lord-icon>
                        </div>
                      </div>
                    </td>
                    <td className="py-1 text-center  gap-2">
                      <span>
                        <lord-icon
                          className="hover:cursor-pointer mx-1"
                          onClick={() => editpassword(item.id)}
                          style={{
                            width: "25px",
                            height: "25px",
                            paddingTop: "3px",
                          }}
                          src="https://cdn.lordicon.com/gwlusjdu.json"
                          trigger="hover"
                        ></lord-icon>
                      </span>
                      <span>
                        <lord-icon
                          className="hover:cursor-pointer mx-1"
                          onClick={() => deletepassword(item.id)}
                          src="https://cdn.lordicon.com/jzinekkv.json"
                          trigger="hover"
                          style={{
                            width: "25px",
                            height: "25px",
                            paddingTop: "3px",
                          }}
                        ></lord-icon>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;
