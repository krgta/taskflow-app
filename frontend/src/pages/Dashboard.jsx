import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/projects/")
      .then((res) => setProjects(res.data))
      .catch(() => alert("Error"));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      {projects.map((p) => (
        <div key={p.id} onClick={() => navigate(`/project/${p.id}`)}>
          {p.name}
        </div>
      ))}
    </div>
  );
}

export default Dashboard;