import { Link } from "react-router-dom";

const JOB_STATUS_LABELS = {
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
};

function JobCard({ job }) {
  return (
    <div className="job-card">
      <div className="job-card__header">
        <div>
          <h2>{job.title}</h2>
          <p>{job.company}</p>
        </div>

        <span className="job-card__status">
          {JOB_STATUS_LABELS[job.status] || job.status}
        </span>
      </div>

      <div className="job-card__info">
        <span>Địa điểm: {job.location}</span>

        <span>
          Mức lương: {job.salaryMin.toLocaleString()} -{" "}
          {job.salaryMax.toLocaleString()} VNĐ
        </span>

        <span>Hình thức: {job.employmentType}</span>
      </div>

      <div className="job-card__skills">
        {job.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <p className="job-card__description">{job.description}</p>

      <Link to={`/jobs/${job._id}`} className="job-card__button">
        Xem chi tiết
      </Link>
    </div>
  );
}

export default JobCard;
