import React, { useState } from "react";

function SearchField(props) {
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    props.searchTask(name);
  }

  function handleChange(e) {
    setName(e.target.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="label-wrapper">
        <label htmlFor="new-todo-input" className="label__lg">
          Where is my todo?
        </label>
      </h2>
      <input
        type="text"
        id="new-todo-input"
        className="input input__lg"
        name="text"
        autoComplete="off"
        value={name}
        onChange={handleChange}
      />
      <button type="submit" className="btn btn__primary btn__lg">
        Search
      </button>
    </form>
  );
}

export default SearchField;
