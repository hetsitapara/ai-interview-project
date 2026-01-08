import "../styles/blog.css";

export default function Blogs() {
  return (
    <div className="blogs-page">
      <div className="blogs-card">

        <h2 className="blogs-title">Blogs & Interview Tips</h2>

        {/* Search */}
        <input
          className="blogs-search"
          placeholder="Search blogs..."
        />

        <div className="blogs-layout">

          {/* Blog List */}
          <div className="blogs-list">
            <BlogCard tag="DSA" />
            <BlogCard tag="HR" />
            <BlogCard tag="Career Tips" />
          </div>

          {/* Sidebar */}
          <div className="blogs-sidebar">
            <h4>Categories</h4>
            <ul>
              <li>DSA</li>
              <li>System Design</li>
              <li>HR</li>
              <li>Career Tips</li>
            </ul>

            <h4>Popular Blogs</h4>
            <ul className="popular">
              <li>First Technical Interview</li>
              <li>System Design Basics</li>
              <li>HR Interview Mistakes</li>
              <li>Career Growth Tips</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

function BlogCard({ tag }) {
  return (
    <div className="blog-card">
      <h3>Blog Title</h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna.
      </p>

      <div className="blog-footer">
        <span className={`tag ${tag.replace(" ", "").toLowerCase()}`}>
          {tag}
        </span>
        <span className="meta">By Author Name • Jun 3, 2021</span>
        <button className="read-btn">Read More</button>
      </div>
    </div>
  );
}
