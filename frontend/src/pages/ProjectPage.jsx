import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const columns = ["To Do", "In Progress", "Done"];

function ProjectPage() {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    API.get(`/tasks/${id}`)
      .then((res) => setTasks(res.data))
      .catch(() => alert("Error"));
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  // group tasks
  const grouped = {};
  columns.forEach((col) => {
    grouped[col] = tasks.filter((t) => t.status === col);
  });

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "20px" }}>
        {columns.map((col) => (
          <div
            key={col}
            id={col}
            style={{
              width: "300px",
              minHeight: "400px",
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>{col}</h3>

            <SortableContext
              items={grouped[col].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {grouped[col].map((task) => (
                <div
                  key={task.id}
                  id={task.id}
                  style={{
                    background: "white",
                    margin: "10px 0",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "grab",
                  }}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p>{task.priority}</p>
                </div>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

export default ProjectPage;