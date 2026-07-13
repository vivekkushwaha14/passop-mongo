import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Manager = ({ username }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setform] = useState({ site: "", username: "", password: "" });
  const [passwordsArray, setpasswordsArray] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const getpasswords = useCallback(async () => {
    if (!username) return;
    try {
      let req = await fetch(`${API_URL}/`, {
        headers: {
          "X-User-Id": username,
        },
      });
      let passwords = await req.json();
      console.log(passwords);
      setpasswordsArray(Array.isArray(passwords) ? passwords : []);
    } catch (err) {
      console.error("Error fetching passwords:", err);
    }
  }, [username]);

  useEffect(() => {
    getpasswords();
  }, [getpasswords]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const savepassword = async () => {
    if (
      form.site.length > 3 &&
      form.username.length > 3 &&
      form.password.length > 3
    ) {
      const newId = form.id || uuidv4();

      try {
        // Delete old entry if editing
        if (form.id) {
          await fetch(`${API_URL}/`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-User-Id": username,
            },
            body: JSON.stringify({ id: form.id }),
          });
        }

        const passwordObj = {
          ...form,
          id: newId,
        };

        // Update frontend state
        setpasswordsArray([...passwordsArray.filter(item => item.id !== form.id), passwordObj]);

        // Save to backend
        await fetch(`${API_URL}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": username,
            },
          body: JSON.stringify(passwordObj),
        });

        // Clear form
        setform({ site: "", username: "", password: "" });

        toast("Password saved!", {
          position: "top-right",
          autoClose: 4000,
          theme: "light",
        });
      } catch (err) {
        console.error("Error saving password:", err);
        toast.error("Error: Password not saved!");
      }
    } else {
      toast("Error: Password not saved!");
    }
  };

  const deletepassword = async (id) => {
    if (confirm("Are you sure you want to delete this password?")) {
      try {
        setpasswordsArray(passwordsArray.filter((item) => item.id !== id));
        await fetch(`${API_URL}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": username,
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
      } catch (err) {
        console.error("Error deleting password:", err);
        toast.error("Error deleting password!");
      }
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

  // Filter passwords based on search query
  const filteredPasswords = passwordsArray.filter(
    (item) =>
      item.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="absolute inset-0 -z-10 max-h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <div className="mx-auto bg-blue-200 justify-center max-w-5xl rounded-sm max-h-full">
        <div className="text-white flex flex-col p-4 justify-center items-center gap-2 pb-5 md:pr-2">
          <h1 className="text-4xl font-bold text-center select-none text-black">
            <span className="text-blue-800"> &lt;</span>
            Pass
            <span className="text-blue-800">Op/ &gt;</span>
          </h1>
          <p className="text-blue-900 font-bold">Your own password manager</p>
          <input
            value={form.site}
            onChange={handlechange}
            placeholder="Enter Website URL"
            className="rounded-lg w-full bg-white text-black border border-blue-900 p-3 py-1"
            type="text"
            name="site"
            id="site"
          />
          <div className="flex flex-col md:flex-row gap-4 w-full">
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
                className="rounded-lg bg-white text-black border border-blue-900 p-3 py-1 w-full"
                name="password"
              />
              <span
                className="absolute right-2 top-2 cursor-pointer"
                onClick={togglePassword}
              >
                {showPassword ? (
                  <img
                    src="/icons/close eye.png"
                    alt="show password"
                    className="h-6 w-6 hover:cursor-pointer top-[-5px]"
                  />
                ) : (
                  <img
                    src="/icons/open eye.png"
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <h2 className="flex justify-center font-bold text-black text-lg md:text-xl">
              Your Saved Passwords
            </h2>
            
            {/* Search Input styled matching original inputs */}
            {passwordsArray.length > 0 && (
              <input
                type="text"
                placeholder="Search Site or Username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg bg-white text-black border border-blue-900 px-3 py-1 text-sm w-full md:w-64"
              />
            )}
          </div>

          {passwordsArray.length === 0 && (
            <div className="flex justify-center text-blue-900 font-bold">
              No passwords saved yet.
            </div>
          )}
          
          {passwordsArray.length > 0 && filteredPasswords.length === 0 && (
            <div className="flex justify-center text-blue-900 font-bold">
              No matching records found.
            </div>
          )}

          {passwordsArray.length > 0 && filteredPasswords.length > 0 && (
            <>
              {/* Desktop Table View */}
              <table className="table-auto w-full overflow-hidden rounded-md hidden md:table">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="py-1">Site</th>
                    <th className="py-1">Username</th>
                    <th className="py-1">Password</th>
                    <th className="py-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-blue-300">
                  {filteredPasswords.map((item, index) => (
                    <tr key={index}>
                      <td className="py-1 text-center">
                        <div className="flex items-center justify-center">
                          <a href={item.site} target="_blank" rel="noreferrer" className="hover:underline">
                            {item.site}
                          </a>
                          <div
                            className="size-6 ml-2 lordiconcopy cursor-pointer"
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
                            className="size-6 ml-2 lordiconcopy cursor-pointer"
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
                      <td className="py-1 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>
                            {visiblePasswords[item.id]
                              ? item.password
                              : "*".repeat(item.password.length)}
                          </span>
                          
                          <span
                            className="cursor-pointer"
                            onClick={() => togglePasswordVisibility(item.id)}
                          >
                            {visiblePasswords[item.id] ? (
                              <img
                                src="/icons/close eye.png"
                                alt="hide password"
                                className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                              />
                            ) : (
                              <img
                                src="/icons/open eye.png"
                                alt="show password"
                                className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity"
                              />
                            )}
                          </span>

                          <div
                            className="size-6 ml-1 lordiconcopy cursor-pointer"
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
                      <td className="py-1 text-center">
                        <span className="inline-block">
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
                        <span className="inline-block">
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

              {/* Mobile Card View (Styled with original solid blue palette) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredPasswords.map((item, index) => (
                  <div key={index} className="bg-blue-300 border border-blue-900/30 rounded-xl p-4 flex flex-col gap-3 text-black">
                    <div className="flex justify-between items-center bg-blue-700 text-white p-2.5 rounded-lg font-bold">
                      <a
                        href={item.site}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-sm truncate max-w-[200px]"
                      >
                        {item.site}
                      </a>
                      <button
                        onClick={copytext(item.site)}
                        className="p-1 rounded hover:bg-blue-800 transition-colors cursor-pointer"
                      >
                        <lord-icon
                          className="cursor-pointer"
                          style={{ width: "18px", height: "18px", filter: "invert(1)" }}
                          src="https://cdn.lordicon.com/iykgtsbt.json"
                          trigger="hover"
                        ></lord-icon>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 text-sm px-1">
                      <div className="flex justify-between items-center py-1 border-b border-blue-900/10">
                        <span className="font-bold text-blue-900">Username:</span>
                        <div className="flex items-center gap-1.5">
                          <span>{item.username}</span>
                          <button
                            onClick={copytext(item.username)}
                            className="p-0.5 rounded hover:bg-blue-400 transition-colors cursor-pointer"
                          >
                            <lord-icon
                              className="cursor-pointer"
                              style={{ width: "16px", height: "16px" }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-blue-900/10">
                        <span className="font-bold text-blue-900">Password:</span>
                        <div className="flex items-center gap-1.5">
                          <span>
                            {visiblePasswords[item.id] ? item.password : "*".repeat(item.password.length)}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="p-0.5 rounded hover:bg-blue-400 transition-colors cursor-pointer"
                          >
                            {visiblePasswords[item.id] ? (
                              <img src="/icons/close eye.png" alt="Hide" className="h-4.5 w-4.5 opacity-70" />
                            ) : (
                              <img src="/icons/open eye.png" alt="Show" className="h-4.5 w-4.5 opacity-70" />
                            )}
                          </button>
                          <button
                            onClick={copytext(item.password)}
                            className="p-0.5 rounded hover:bg-blue-400 transition-colors cursor-pointer"
                          >
                            <lord-icon
                              className="cursor-pointer"
                              style={{ width: "16px", height: "16px" }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 mt-1">
                      <button
                        onClick={() => editpassword(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-400 hover:bg-blue-500 border border-blue-900/20 text-black font-semibold transition-all text-xs cursor-pointer active:scale-95"
                      >
                        <lord-icon
                          className="cursor-pointer"
                          style={{ width: "16px", height: "16px" }}
                          src="https://cdn.lordicon.com/gwlusjdu.json"
                          trigger="hover"
                        ></lord-icon>
                        Edit
                      </button>
                      <button
                        onClick={() => deletepassword(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-400 hover:bg-red-500 border border-blue-900/20 text-black font-semibold transition-all text-xs cursor-pointer active:scale-95"
                      >
                        <lord-icon
                          className="cursor-pointer"
                          style={{ width: "16px", height: "16px" }}
                          src="https://cdn.lordicon.com/jzinekkv.json"
                          trigger="hover"
                        ></lord-icon>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;
