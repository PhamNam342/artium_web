import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { artworkService } from '../features/artworks/artworkService';
import type { ArtworkDimensions, ArtworkImage, ArtworkWeight } from '../features/artworks/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

type Unit = 'in' | 'cm';
type WeightUnit = 'lbs' | 'kg';
type Step = 1 | 2;

type NewSelectedImage = {
  kind: 'new';
  file: File;
  preview: string;
};

type ExistingSelectedImage = {
  kind: 'existing';
  image: ArtworkImage;
  preview: string;
};

type SelectedImage = NewSelectedImage | ExistingSelectedImage;

type ApiFailure = {
  message?: string | string[];
};

type ArtworkForm = {
  title: string;
  description: string;
  price: string;
  currency: string;
  year: string;
  editionRun: string;
  height: string;
  width: string;
  depth: string;
  weight: string;
  materials: string;
  location: string;
  customTags: string[];
};

const ARTWORK_TAG_GROUPS = [
  {
    label: 'Vibes',
    tags: ['Joyful', 'Natural', 'Vibrant', 'Expressive', 'Peaceful', 'Romantic', 'Bold', 'Dreamy', 'Classic', 'Moody', 'Minimalist', 'Vintage', 'Avant Garde', 'Spiritual', 'Melancholic', 'Other'],
  },
  {
    label: 'Values',
    tags: ['Cultural Heritage', 'Human Experience', 'Pride', 'Futurism', 'Environment', 'Equity', 'Feminism', 'Social Awareness', 'Escapism', 'Empowerment', 'Universal', 'Other'],
  },
  {
    label: 'Mediums',
    tags: ['Painting', 'Drawing', 'Illustration', 'Digital Art', 'Photography', 'Sculpture', 'Installation', 'Collage', 'Immersive', 'Mixed Media', 'Performance Art', 'Prints', 'Public Art', 'Video', 'Ceramics', 'Animation', 'Jewelry', 'Textile', 'Designed Objects', 'Functional Art', 'Concept Art', 'Intellectual Art', 'Other'],
  },
];

const PRESET_TAGS_BY_NAME = new Map(
  ARTWORK_TAG_GROUPS.flatMap((group) => group.tags).map((tag) => [
    tag.toLocaleLowerCase(),
    tag,
  ]),
);

const EMPTY_FORM: ArtworkForm = {
  title: '',
  description: '',
  price: '',
  currency: 'VND',
  year: '',
  editionRun: '',
  height: '',
  width: '',
  depth: '',
  weight: '',
  materials: '',
  location: '',
  customTags: [],
};

export default function UploadArtworkPage() {
  const navigate = useNavigate();
  const { id: artworkId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const isEditing = Boolean(artworkId);
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ArtworkForm>(EMPTY_FORM);
  const [dimensionUnit, setDimensionUnit] = useState<Unit>('in');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingArtwork, setIsLoadingArtwork] = useState(isEditing);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    imagesRef.current.forEach((image) => {
      if (image.kind === 'new') URL.revokeObjectURL(image.preview);
    });
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const loadArtwork = async () => {
      if (!artworkId) {
        setIsLoadingArtwork(false);
        return;
      }

      setIsLoadingArtwork(true);
      try {
        const artwork = await artworkService.getArtwork(artworkId);
        if (!isCurrent) return;

        const dimensions = artwork.dimensions;
        const weight = artwork.weight;
        const weightValue = typeof weight === 'object' && weight !== null
          ? weight.value
          : weight;
        const weightUnitValue = typeof weight === 'object' && weight !== null
          ? weight.unit
          : undefined;

        setForm({
          title: artwork.title,
          description: artwork.description || '',
          price: artwork.price || '',
          currency: artwork.currency || 'VND',
          year: '',
          editionRun: '',
          height: dimensions?.height === undefined ? '' : String(dimensions.height),
          width: dimensions?.width === undefined ? '' : String(dimensions.width),
          depth: dimensions?.depth === undefined ? '' : String(dimensions.depth),
          weight: weightValue === undefined || weightValue === null ? '' : String(weightValue),
          materials: artwork.materials || '',
          location: artwork.location || '',
          customTags: artwork.customTags || [],
        });
        setDimensionUnit(dimensions?.unit === 'cm' ? 'cm' : 'in');
        setWeightUnit(weightUnitValue === 'kg' ? 'kg' : 'lbs');
        setImages((artwork.images || []).map((image) => ({
          kind: 'existing' as const,
          image,
          preview: image.secureUrl || image.url,
        })));
      } catch (error) {
        console.error('Artwork edit load failed', error);
        toast.error(t('common.unexpectedError'));
        navigate('/inventory', { replace: true });
      } finally {
        if (isCurrent) setIsLoadingArtwork(false);
      }
    };

    void loadArtwork();
    return () => { isCurrent = false; };
  }, [artworkId, navigate, t]);

  const updateForm = (field: keyof ArtworkForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleArtworkTag = (tag: string) => {
    setForm((current) => {
      const isSelected = current.customTags.includes(tag);
      if (isSelected) {
        return { ...current, customTags: current.customTags.filter((item) => item !== tag) };
      }
      if (current.customTags.length >= 10) {
        toast.error(t('inventory.upload.tagsSelected', { count: 10 }));
        return current;
      }
      return { ...current, customTags: [...current.customTags, tag] };
    });
  };

  const addCustomTag = async (value: string) => {
    const tag = value.trim().replace(/\s+/g, ' ');
    if (!tag) return false;
    if (tag.length > 40) {
      toast.error(t('common.unexpectedError'));
      return false;
    }
    if (form.customTags.length >= 10) {
      toast.error(t('inventory.upload.tagsSelected', { count: 10 }));
      return false;
    }
    if (form.customTags.some((current) => current.toLowerCase() === tag.toLowerCase())) {
      toast.error(t('common.unexpectedError'));
      return false;
    }

    const presetTag = PRESET_TAGS_BY_NAME.get(tag.toLocaleLowerCase());
    if (presetTag) {
      setForm((current) => ({
        ...current,
        customTags: [...current.customTags, presetTag],
      }));
      toast(presetTag);
      return true;
    }

    try {
      const createdTag = await artworkService.createArtworkTag(tag);
      setForm((current) => ({
        ...current,
        customTags: current.customTags.some(
          (currentTag) => currentTag.toLocaleLowerCase() === createdTag.name.toLocaleLowerCase(),
        ) || current.customTags.length >= 10
          ? current.customTags
          : [...current.customTags, createdTag.name],
      }));
      return true;
    } catch {
      toast.error(t('common.unexpectedError'));
      return false;
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const candidates = Array.from(files);
    const availableSlots = MAX_IMAGE_COUNT - images.length;

    if (availableSlots <= 0) {
      toast.error(t('inventory.upload.maxImages', { count: MAX_IMAGE_COUNT }));
      return;
    }

    const validFiles = candidates
      .filter((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(t('common.unexpectedError'));
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(t('common.unexpectedError'));
          return false;
        }
        return true;
      })
      .slice(0, availableSlots);

    if (candidates.length > availableSlots) {
      toast(t('inventory.upload.maxImages', { count: availableSlots }));
    }

    setImages((current) => [
      ...current,
      ...validFiles.map((file) => ({ kind: 'new' as const, file, preview: URL.createObjectURL(file) })),
    ]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const removedImage = current[index];
      if (removedImage?.kind === 'new') URL.revokeObjectURL(removedImage.preview);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const goToReview = () => {
    if (!form.title.trim()) {
      toast.error(t('common.requiredFields'));
      return;
    }
    if (images.length === 0) {
      toast.error(t('common.requiredFields'));
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildDimensions = (): ArtworkDimensions | null => {
    const height = Number(form.height);
    const width = Number(form.width);
    const depth = Number(form.depth);
    const hasDimension = [form.height, form.width, form.depth].some((value) => value.trim() !== '');

    if (!hasDimension) return null;

    return {
      ...(Number.isFinite(height) && height >= 0 ? { height } : {}),
      ...(Number.isFinite(width) && width >= 0 ? { width } : {}),
      ...(Number.isFinite(depth) && depth >= 0 ? { depth } : {}),
      unit: dimensionUnit,
    };
  };

  const saveDraft = async () => {
    if (!user) return;

    setIsSaving(true);
    let saveStage = isEditing ? 'update the artwork' : 'create the artwork';
    try {
      const weightValue = Number(form.weight);
      const weight: ArtworkWeight | null = Number.isFinite(weightValue) && form.weight.trim()
        ? { value: weightValue, unit: weightUnit }
        : null;
      const price = form.price.trim();
      const priceValue = Number(price);
      if (price && (!Number.isFinite(priceValue) || priceValue < 0)) {
        toast.error(t('common.unexpectedError'));
        return;
      }

      const artworkInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: 'DRAFT' as const,
        isPublished: false,
        ...(price ? { price: priceValue, currency: form.currency } : {}),
        materials: form.materials.trim(),
        dimensions: buildDimensions(),
        weight,
        ...(form.year ? { creationYear: Number(form.year) } : {}),
        ...(form.editionRun.trim() ? { editionRun: form.editionRun.trim() } : {}),
        ...(form.location.trim() ? { location: form.location.trim() } : {}),
        customTags: form.customTags,
      };

      const existingImages = images.flatMap((image) => image.kind === 'existing' ? [image.image] : []);
      const newFiles = images.flatMap((image) => image.kind === 'new' ? [image.file] : []);

      if (artworkId) {
        let uploadedImages: ArtworkImage[] = [];
        if (newFiles.length > 0) {
          saveStage = 'upload the artwork images';
          uploadedImages = await artworkService.uploadArtworkImages({
            files: newFiles,
            artworkId,
            altText: form.title.trim(),
          });
        }

        saveStage = 'update the artwork';
        await artworkService.updateArtwork(artworkId, {
          ...artworkInput,
          ...(price ? {} : { price: null, currency: null }),
          images: [...existingImages, ...uploadedImages].map((image, index) => ({
            ...image,
            order: index,
            isPrimary: index === 0,
          })),
        });
        toast.success(t('inventory.upload.saveChanges'));
      } else {
        const artwork = await artworkService.createArtwork(artworkInput);
        saveStage = 'upload the artwork images';
        const uploadedImages = await artworkService.uploadArtworkImages({
          // The draft exists before files can be stored under its artwork ID.
          files: newFiles,
          artworkId: artwork.id,
          altText: form.title.trim(),
        });

        saveStage = 'save the image details';
        await artworkService.updateArtwork(artwork.id, {
          images: uploadedImages.map((image, index) => ({
            ...image,
            order: index,
            isPrimary: index === 0,
          })),
        });
        toast.success(t('inventory.upload.saveDraft'));
      }
      navigate('/inventory');
    } catch (error) {
      const responseMessage = axios.isAxiosError<ApiFailure>(error)
        ? error.response?.data?.message
        : undefined;
      const detail = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage || (error instanceof Error ? error.message : undefined);

      console.error('Artwork draft save failed', { saveStage, error });
      toast.error(
        detail
          ? detail
          : t('common.unexpectedError'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const artistName = user?.email.split('@')[0] || t('inventory.yourAccount');

  if (isLoadingArtwork) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-slate-500">
        {t('inventory.upload.loading')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 text-slate-950">
      <header className="flex h-20 items-center justify-center border-b border-slate-200 px-5">
        <Link to="/inventory" className="absolute left-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950 sm:left-10">
          <ArrowLeft size={18} />
          {t('inventory.title')}
        </Link>
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">{isEditing ? t('inventory.upload.editTitle') : t('inventory.upload.uploadTitle')}</h1>
      </header>

      <main className="mx-auto grid max-w-[1560px] gap-7 px-5 py-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <section className="space-y-7">
          <div className="rounded-[24px] border border-slate-200 p-6">
            <p className="text-sm font-bold tracking-wide text-slate-500">{t('inventory.upload.artistName').toUpperCase()} <span className="text-red-500">*</span></p>
            <div className="mt-5 flex items-center gap-4 rounded-[18px] border border-slate-100 px-5 py-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lime-200 text-2xl font-semibold text-slate-700">
                {artistName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-semibold text-slate-700">{artistName}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-400">{t('inventory.upload.thatsYou')}</p>
              </div>
            </div>
          </div>

          <div
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`min-h-[480px] rounded-[24px] border-2 border-dashed p-6 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
          >
            {images.length === 0 ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                <div className="flex h-24 w-24 rotate-[-5deg] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                  <ImagePlus size={32} className="text-slate-400" strokeWidth={1.4} />
                </div>
                <h2 className="mt-8 max-w-sm text-[25px] font-bold leading-tight tracking-[-0.03em]">{t('inventory.upload.dropImages')}</h2>
                <p className="mt-5 text-sm text-slate-500">{t('inventory.upload.supportedImages')}</p>
                <p className="mt-2 text-sm text-slate-500">{t('inventory.upload.maxImages', { count: MAX_IMAGE_COUNT })}</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-8 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50">
                  {t('inventory.upload.uploadImages')}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{t('inventory.upload.artworkImages')}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t('inventory.upload.primaryImageHint')}</p>
                  </div>
                  <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                    <Plus size={17} /> {t('inventory.upload.addImages')}
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div key={image.kind === 'new' ? `${image.file.name}-${index}` : `${image.image.publicId || image.image.url}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img src={image.preview} alt={t('inventory.upload.previewAlt', { index: index + 1 })} className="h-full w-full object-cover" />
                      {index === 0 && <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">{t('inventory.upload.primary')}</span>}
                      <button type="button" onClick={() => removeImage(index)} aria-label={t('inventory.upload.removeImage', { index: index + 1 })} className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-600 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".gif,.png,.jpg,.jpeg,.webp" multiple className="sr-only" onChange={handleFileChange} />
          </div>
        </section>

        <section className={step === 1 ? 'rounded-[24px] border border-slate-200 p-6 sm:p-8' : ''}>
          {step === 1 ? (
            <ArtworkDetailsForm
              form={form}
              dimensionUnit={dimensionUnit}
              weightUnit={weightUnit}
              onChange={updateForm}
              onDimensionUnitChange={setDimensionUnit}
              onWeightUnitChange={setWeightUnit}
            />
          ) : (
            <ArtworkTagsBoard tags={form.customTags} onToggle={toggleArtworkTag} onAdd={addCustomTag} />
          )}
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 flex h-[76px] items-center border-t border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between">
          <Link to="/inventory" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold hover:bg-slate-50">{t('inventory.cancel')}</Link>
          <div className="hidden items-center gap-3 text-sm font-semibold text-slate-500 sm:flex">
            <span className={`h-3 w-3 rounded-full ${step >= 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <span className={`h-3 w-3 rounded-full ${step === 2 ? 'bg-emerald-400' : 'border border-emerald-400 bg-white'}`} />
            {t('inventory.upload.step', { step })}
          </div>
          {step === 1 ? (
            <button type="button" onClick={goToReview} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              {t('inventory.upload.continue')}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setStep(1)} disabled={isSaving} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">{t('inventory.upload.back')}</button>
              <button type="button" onClick={saveDraft} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                {isSaving && <LoaderCircle size={16} className="animate-spin" />}
                {isEditing ? t('inventory.upload.saveChanges') : t('inventory.upload.saveDraft')}
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

function ArtworkDetailsForm({
  form,
  dimensionUnit,
  weightUnit,
  onChange,
  onDimensionUnitChange,
  onWeightUnitChange,
}: {
  form: ArtworkForm;
  dimensionUnit: Unit;
  weightUnit: WeightUnit;
  onChange: (field: keyof ArtworkForm, value: string) => void;
  onDimensionUnitChange: (unit: Unit) => void;
  onWeightUnitChange: (unit: WeightUnit) => void;
}) {
  const { t } = useI18n();

  return (
    <div>
      <h2 className="text-lg font-bold tracking-wide text-slate-500">{t('inventory.upload.details').toUpperCase()}</h2>
      <FieldLabel label={t('inventory.upload.artworkTitle').toUpperCase()} required />
      <input value={form.title} maxLength={100} onChange={(event) => onChange('title', event.target.value)} placeholder={t('inventory.upload.artworkTitle')} className="field-input" />
      <CharacterCount current={form.title.length} max={100} />

      <FieldLabel label={t('inventory.upload.description').toUpperCase()} />
      <textarea value={form.description} maxLength={5000} onChange={(event) => onChange('description', event.target.value)} placeholder={t('inventory.upload.artworkDescription')} className="field-input min-h-[125px] resize-y py-4" />
      <CharacterCount current={form.description.length} max={5000} />

      <FieldLabel label={t('inventory.upload.pricing').toUpperCase()} />
      <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
        <NumberField label={t('inventory.upload.price')} value={form.price} onChange={(value) => onChange('price', value)} />
        <label className="block text-xs font-medium text-slate-500">{t('inventory.upload.currency')}
          <select value={form.currency} onChange={(event) => onChange('currency', event.target.value)} className="field-input mt-2">
            <option value="VND">VND</option>
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-400">{t('inventory.upload.priceHint')}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><FieldLabel label={t('inventory.upload.year').toUpperCase()} /><input inputMode="numeric" value={form.year} maxLength={4} onChange={(event) => onChange('year', event.target.value.replace(/\D/g, ''))} placeholder="2001" className="field-input" /></div>
        <div><FieldLabel label={t('inventory.upload.editionRun').toUpperCase()} /><input value={form.editionRun} maxLength={24} onChange={(event) => onChange('editionRun', event.target.value)} placeholder={t('inventory.upload.editionRunPlaceholder')} className="field-input" /><CharacterCount current={form.editionRun.length} max={24} /></div>
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div>
          <FieldLabel label={t('inventory.dimensions').toUpperCase()} />
          <UnitToggle value={dimensionUnit} values={['in', 'cm'] as const} onChange={onDimensionUnitChange} />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <NumberField label={t('inventory.upload.height', { unit: dimensionUnit })} value={form.height} onChange={(value) => onChange('height', value)} />
            <NumberField label={t('inventory.upload.width', { unit: dimensionUnit })} value={form.width} onChange={(value) => onChange('width', value)} />
            <NumberField label={t('inventory.upload.depth', { unit: dimensionUnit })} value={form.depth} onChange={(value) => onChange('depth', value)} />
          </div>
        </div>
        <div>
          <FieldLabel label={t('inventory.upload.weight', { unit: '' }).toUpperCase()} />
          <UnitToggle value={weightUnit} values={['lbs', 'kg'] as const} onChange={onWeightUnitChange} />
          <div className="mt-4"><NumberField label={t('inventory.upload.weight', { unit: weightUnit })} value={form.weight} onChange={(value) => onChange('weight', value)} /></div>
        </div>
      </div>

      <FieldLabel label={t('inventory.upload.materials').toUpperCase()} />
      <input value={form.materials} maxLength={80} onChange={(event) => onChange('materials', event.target.value)} placeholder={t('inventory.upload.materialsPlaceholder')} className="field-input" />
      <CharacterCount current={form.materials.length} max={80} />

      <FieldLabel label={t('inventory.upload.artworkLocation').toUpperCase()} />
      <input value={form.location} maxLength={120} onChange={(event) => onChange('location', event.target.value)} placeholder={t('inventory.upload.locationPlaceholder')} className="field-input" />
    </div>
  );
}

function ArtworkTagsBoard({ tags, onToggle, onAdd }: { tags: string[]; onToggle: (tag: string) => void; onAdd: (tag: string) => Promise<boolean> }) {
  const { t } = useI18n();
  const [customTag, setCustomTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const isAddingTagRef = useRef(false);
  const addTag = async () => {
    if (isAddingTagRef.current) return;

    isAddingTagRef.current = true;
    setIsAddingTag(true);
    try {
      if (await onAdd(customTag)) setCustomTag('');
    } finally {
      isAddingTagRef.current = false;
      setIsAddingTag(false);
    }
  };

  return (
    <section className="min-h-[620px] rounded-[24px] border border-slate-200 p-6 sm:p-9">
      <h2 className="text-xl font-bold tracking-wide text-slate-500">{t('inventory.upload.customTag').toUpperCase()}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">{t('inventory.upload.customTagDescription')}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={customTag}
          maxLength={40}
          onChange={(event) => setCustomTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void addTag();
            }
          }}
          placeholder={t('inventory.upload.addCustomTag')}
          className="field-input min-w-0 flex-1"
        />
        <button type="button" disabled={isAddingTag} onClick={() => void addTag()} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">{isAddingTag ? t('inventory.upload.adding') : t('inventory.upload.add')}</button>
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full border-2 border-blue-500 bg-white px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-blue-700">
              {tag}
              <button type="button" onClick={() => onToggle(tag)} aria-label={t('inventory.upload.removeTag', { tag })} className="rounded-full p-0.5 hover:bg-blue-100"><X size={13} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-lg font-bold tracking-wide text-slate-500">{t('inventory.upload.artworkTags').toUpperCase()}</h3>
        <p className="text-sm font-medium text-slate-500">{t('inventory.upload.tagsSelected', { count: tags.length })}</p>
      </div>
      <div className="mt-8 space-y-10">
        {ARTWORK_TAG_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-bold tracking-wide text-slate-500">{t(`inventory.upload.${group.label.toLowerCase()}`).toUpperCase()}</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {group.tags.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={`${group.label}-${tag}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggle(tag)}
                    className={`rounded-full border-2 px-4 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors ${selected ? 'border-blue-500 bg-white text-blue-700' : 'border-slate-900 bg-white text-slate-900 hover:border-blue-500 hover:text-blue-700'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return <label className="mb-2 mt-6 block text-sm font-bold tracking-wide text-slate-500">{label}{required && <span className="text-red-500"> *</span>}</label>;
}

function CharacterCount({ current, max }: { current: number; max: number }) {
  const { t } = useI18n();

  return <p className="mt-2 text-right text-xs text-slate-400">{current}/{max} {t('inventory.upload.characters')}</p>;
}

function UnitToggle<T extends string>({ value, values, onChange }: { value: T; values: readonly T[]; onChange: (value: T) => void }) {
  return <div className="flex items-center gap-6 text-sm font-medium text-slate-700">{values.map((unit) => <label key={unit} className="flex cursor-pointer items-center gap-2"><input type="radio" checked={value === unit} onChange={() => onChange(unit)} className="h-4 w-4 accent-blue-600" />{unit}</label>)}</div>;
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-medium text-slate-500">{label}<input inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className="field-input mt-2" /></label>;
}
