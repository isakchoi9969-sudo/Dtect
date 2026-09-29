import { useState } from "react";
import { COMPANY_LOGO_DOMAINS } from "../config/companyLogos";

const LOGO_DEV_TOKEN =
  import.meta.env.VITE_LOGO_DEV_TOKEN || "pk_LmDNVeHjR3Sh2eSen5P1yA";

function CompanyLogo({ companyName, size = 34, visualOffset = { x: 0, y: 0 } }) {
  const [failedCompanyName, setFailedCompanyName] = useState(null);
  const domain = COMPANY_LOGO_DOMAINS[companyName];
  const imageFailed = failedCompanyName === companyName;

  if (!domain || !LOGO_DEV_TOKEN || imageFailed) {
    return (
      <span aria-label={`${companyName} 글자 로고`} title={companyName}>
        {companyName.slice(0, 2)}
      </span>
    );
  }

  return (
    <img
      alt={`${companyName} 로고`}
      src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=128&format=png`}
      onError={() => setFailedCompanyName(companyName)}
      style={{
        display: "block",
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        objectPosition: "center",
        transform: `translate(${visualOffset.x}px, ${visualOffset.y}px)`,
      }}
    />
  );
}

export default CompanyLogo;
