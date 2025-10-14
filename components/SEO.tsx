import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface OpenGraphConfig {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  images?: string[];
  locale?: string;
  siteName?: string;
}

export interface TwitterConfig {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

export interface AdditionalMetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph?: OpenGraphConfig;
  twitter?: TwitterConfig;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  additionalMeta?: AdditionalMetaTag[];
}

const SEO = ({
  title,
  description,
  keywords,
  canonical,
  robots = 'index, follow',
  openGraph,
  twitter,
  structuredData,
  additionalMeta,
}: SEOProps) => {
  const ogImages = openGraph?.images ?? [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}

      {openGraph && (
        <>
          <meta property="og:title" content={openGraph.title ?? title} />
          <meta property="og:description" content={openGraph.description ?? description} />
          {openGraph.url && <meta property="og:url" content={openGraph.url} />}
          <meta property="og:type" content={openGraph.type ?? 'website'} />
          <meta property="og:locale" content={openGraph.locale ?? 'sq_AL'} />
          <meta property="og:site_name" content={openGraph.siteName ?? 'Makina Elektrike'} />
          {ogImages.map((imageUrl, index) => (
            <meta key={`og:image:${index}`} property="og:image" content={imageUrl} />
          ))}
        </>
      )}

      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card ?? 'summary_large_image'} />
          <meta name="twitter:title" content={twitter.title ?? title} />
          <meta name="twitter:description" content={twitter.description ?? description} />
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
          {twitter.site && <meta name="twitter:site" content={twitter.site} />}
          {twitter.creator && <meta name="twitter:creator" content={twitter.creator} />}
        </>
      )}

      {additionalMeta?.map((metaConfig, index) => (
        <meta
          key={`additional-meta-${index}`}
          {...(metaConfig.name ? { name: metaConfig.name } : {})}
          {...(metaConfig.property ? { property: metaConfig.property } : {})}
          content={metaConfig.content}
        />
      ))}

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Helmet>
  );
};

export default SEO;
