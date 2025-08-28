import { useEffect } from "react";

type PageMetaProps = {
  /** Document title */
  title?: string;
  /** <meta name="description"> */
  description?: string;
  /** <meta name="keywords"> */
  keywords?: string;

  /** Open Graph (fallbacks to title/description لو ما اتمرتش) */
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  /** <link rel="canonical"> */
  canonical?: string;

  /** robots control: true = noindex,nofollow | false = index,follow */
  noIndex?: boolean;
};

function setMetaByName(name: string, content?: string) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setMetaByProperty(property: string, content?: string) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonicalLink(href?: string) {
  if (!href) return;
  let link = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

const PageMeta: React.FC<PageMetaProps> = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  noIndex,
}) => {
  useEffect(() => {
    if (title) document.title = title;

    setMetaByName("description", description);
    setMetaByName("keywords", keywords);

    // Open Graph (fallbacks)
    setMetaByProperty("og:title", ogTitle ?? title);
    setMetaByProperty("og:description", ogDescription ?? description);
    setMetaByProperty("og:type", "website");
    setMetaByProperty("og:image", ogImage);

    setCanonicalLink(canonical);

    if (noIndex !== undefined) {
      setMetaByName("robots", noIndex ? "noindex,nofollow" : "index,follow");
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, noIndex]);

  return null;
};

export default PageMeta;
