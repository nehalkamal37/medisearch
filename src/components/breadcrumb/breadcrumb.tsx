import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** العنوان الظاهر فوق الـbreadcrumb */
  title?: string;
  /** alias عشان لو في صفحات قديمة بتبعته */
  pageTitle?: string;
  /** عناصر الـbreadcrumb */
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ title, pageTitle, items = [] }) => {
  const displayTitle = title ?? pageTitle;

  return (
    <div className="breadcrumb-arrow mb-4">
      {displayTitle && <h4 className="mb-1">{displayTitle}</h4>}
      <div className="text-end">
        <nav aria-label="Breadcrumb navigation">
          <ol className="breadcrumb m-0 py-0">
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              return (
                <li
                  key={`${item.label}-${idx}`}
                  className={`breadcrumb-item${isLast ? " active" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isLast || !item.href ? (
                    <span>{item.label}</span>
                  ) : (
                    <Link to={item.href} aria-label={`Navigate to ${item.label}`}>
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
