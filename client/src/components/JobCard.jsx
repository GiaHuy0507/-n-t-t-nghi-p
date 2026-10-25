import { Link } from "react-router-dom";
import CompanyMark from "./CompanyMark";
import {
  JOB_STATUS_LABELS,
  formatDate,
  formatEmploymentType,
  formatSalary,
} from "../utils/format";

function JobCard({ job }) {
  const skills = job.skills || [];

  return (
    <article className="job-row">
      <CompanyMark name={job.company} />

      <div className="job-row__main">
        <h2>
          <Link to={`/jobs/${job._id}`}>{job.title}</Link>
        </h2>
        <p className="job-row__company">{job.company}</p>
        <p className="job-row__meta">
          <span>{job.location || "Chưa rõ địa điểm"}</span>
          <span>{formatEmploymentType(job.employmentType)}</span>
          {job.createdAt && <span>Đăng {formatDate(job.createdAt)}</span>}
        </p>
        {skills.length > 0 && (
          <div className="tags">
            {skills.slice(0, 6).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
      </div>

      <div className="job-row__side">
        <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
        {job.status === "CLOSED" && (
          <span className="badge badge--closed">
            {JOB_STATUS_LABELS.CLOSED}
          </span>
        )}
      </div>
    </article>
  );
}

export default JobCard;
