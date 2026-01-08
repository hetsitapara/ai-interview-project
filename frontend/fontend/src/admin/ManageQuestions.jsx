import AdminLayout from "./AdminLayout";
export default function ManageQuestions() {
  return (
    <>
      <div className="admin-header">
        <h3>Admin Dashboard - Manage Questions</h3>

        <input
          type="text"
          className="admin-search"
          placeholder="Search..."
        />
      </div>

      <button className="add-btn">+ Add New Question</button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question Title</th>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>Explain B-Tree and B+ Tree</td>
            <td>DBMS</td>
            <td>High</td>
            <td>2027-10-13</td>
            <td>
              <button className="edit-btn">Edit</button>
              <button className="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="pagination">
        Page 1 of 3
        <button>{"<"}</button>
        <button className="active">1</button>
        <button>{">"}</button>
      </div>
    </>
  );
}
