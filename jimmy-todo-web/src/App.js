import React, { useState, useRef, useEffect } from "react";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";
import Todo from "./components/Todo";
import SearchField from "./components/SearchField";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");

  function reFetchTodoList() {
    fetch("https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/")
      .then((res) => res.json())
      .then((resJson) => {
        let newItem = [];
        resJson.items.map((item) => {
          newItem.push({ id: item.id, name: item.todo, completed: item.done });
        });
        setTasks(newItem);
      });
  }

  function searchTask(name) {
    fetch(
      `https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/?searchTerm=${name}`
    )
      .then((res) => res.json())
      .then((resJson) => {
        let newItem = [];
        resJson.items.map((item) => {
          newItem.push({
            id: item.id,
            name: item.todo,
            completed: item.done,
          });
        });
        setTasks(newItem);
      });
  }

  function addTask(name) {
    const newTask = { todo: name };
    fetch("https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/", {
      body: JSON.stringify(newTask),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      mode: "cors",
    }).finally(reFetchTodoList);
  }

  function editTask(id, newName, completed) {
    const newTask = { todo: newName, done: completed };
    fetch(`https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/${id}`, {
      body: JSON.stringify(newTask),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
      mode: "cors",
    }).finally(reFetchTodoList);
  }

  function toggleTaskCompleted(id, name, completed) {
    const newTask = { todo: name, done: !completed };
    fetch(`https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/${id}`, {
      body: JSON.stringify(newTask),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
      mode: "cors",
    }).finally(reFetchTodoList);
  }

  function deleteTask(id) {
    fetch(`https://h08x4ffpvh.execute-api.us-east-1.amazonaws.com/Prod/${id}`, {
      headers: {
        "content-type": "application/json",
      },
      method: "DELETE",
      mode: "cors",
    }).finally(reFetchTodoList);
  }

  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  const listHeadingRef = useRef(null);
  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (tasks.length - prevTaskLength === -1) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  useEffect(() => {
    reFetchTodoList();
  }, []);

  return (
    <div className="todoapp stack-large">
      <h1>Jimmy's Todo</h1>
      <Form addTask={addTask} />
      <SearchField searchTask={searchTask} />
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;
