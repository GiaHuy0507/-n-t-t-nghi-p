import { companyMark } from "../utils/format";

function CompanyMark({ name, size = 44 }) {
  const { letter, color } = companyMark(name);

  return (
    <span
      className="company-mark"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size * 0.45,
      }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}

export default CompanyMark;
