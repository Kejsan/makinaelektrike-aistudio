import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlogPost } from '../../types';

export interface BlogPostFormValues extends Omit<BlogPost, 'id'> {
  id?: string;
}

interface BlogPostFormProps {
  initialValues?: BlogPost;
  onSubmit: (values: BlogPostFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface BlogPostFormState {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
}

const defaultState: BlogPostFormState = {
  title: '',
  excerpt: '',
  author: '',
  date: '',
  imageUrl: '',
};

const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const BlogPostForm: React.FC<BlogPostFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<BlogPostFormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialValues) {
      setFormState(defaultState);
      return;
    }

    setFormState({
      title: initialValues.title ?? '',
      excerpt: initialValues.excerpt ?? '',
      author: initialValues.author ?? '',
      date: initialValues.date ?? '',
      imageUrl: initialValues.imageUrl ?? '',
    });
  }, [initialValues]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fieldLabels = {
    title: t('admin.fields.title'),
    excerpt: t('admin.fields.excerpt'),
    author: t('admin.fields.author'),
    date: t('admin.fields.publishDate'),
    imageUrl: t('admin.fields.imageUrl'),
  } as const;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const requiredMessage = (label: string) => `${label} ${t('admin.required', { defaultValue: 'is required' })}`;

    if (!formState.title.trim()) {
      nextErrors.title = requiredMessage(fieldLabels.title);
    }

    if (!formState.excerpt.trim()) {
      nextErrors.excerpt = requiredMessage(fieldLabels.excerpt);
    }

    if (!formState.author.trim()) {
      nextErrors.author = requiredMessage(fieldLabels.author);
    }

    if (!formState.date.trim()) {
      nextErrors.date = requiredMessage(fieldLabels.date);
    }

    if (!isValidUrl(formState.imageUrl)) {
      nextErrors.imageUrl = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const baseTitle = formState.title.trim();
    const baseExcerpt = formState.excerpt.trim();

    const payload: BlogPostFormValues = {
      title: baseTitle,
      excerpt: baseExcerpt,
      author: formState.author.trim(),
      date: formState.date,
      slug:
        initialValues?.slug ??
        baseTitle
          .toLowerCase()
          .replace(/[^a-zà-ž0-9\s-]/gi, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
      readTime: initialValues?.readTime ?? '5 minuta lexim',
      metaTitle: initialValues?.metaTitle ?? baseTitle,
      metaDescription: initialValues?.metaDescription ?? baseExcerpt,
      tags: initialValues?.tags ?? [],
      sections:
        initialValues?.sections ?? [
          {
            id: 'hyrje',
            heading: baseTitle,
            paragraphs: [baseExcerpt],
          },
        ],
    };

    if (initialValues?.id) {
      payload.id = initialValues.id;
    }

    const resolvedImageUrl = formState.imageUrl.trim() || initialValues?.imageUrl || '';
    if (resolvedImageUrl) {
      payload.imageUrl = resolvedImageUrl;
    } else {
      payload.imageUrl = '';
    }

    if (initialValues?.faqs) {
      payload.faqs = initialValues.faqs;
    }

    if (initialValues?.cta) {
      payload.cta = initialValues.cta;
    }

    await onSubmit(payload);
  };

  const renderInput = (
    label: string,
    name: keyof BlogPostFormState,
    type: string = 'text',
    placeholder?: string,
    options?: { isTextArea?: boolean; rows?: number }
  ) => {
    const error = errors[name as string];
    const commonProps = {
      name,
      value: formState[name],
      onChange: handleChange,
      placeholder,
      className:
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-cyan',
    } as const;

    return (
      <label className="block text-sm text-gray-300">
        <span className="mb-1 inline-block font-medium">{label}</span>
        {options?.isTextArea ? (
          <textarea rows={options.rows ?? 4} {...commonProps} />
        ) : (
          <input type={type} {...commonProps} />
        )}
        {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
      </label>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {renderInput(fieldLabels.title, 'title')}
      {renderInput(fieldLabels.excerpt, 'excerpt', 'text', undefined, { isTextArea: true, rows: 4 })}
      {renderInput(fieldLabels.author, 'author')}
      {renderInput(fieldLabels.date, 'date', 'date')}
      {renderInput(fieldLabels.imageUrl, 'imageUrl')}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
        >
          {t('admin.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? `${t('admin.save')}...` : t('admin.save')}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
