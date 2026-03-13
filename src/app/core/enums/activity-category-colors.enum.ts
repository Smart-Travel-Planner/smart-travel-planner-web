import { ActivityCategory } from './activity-category.enum';

export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.Transporte]: '#7B9CDA',
  [ActivityCategory.Alojamiento]: '#8FBC8F',
  [ActivityCategory.Alimentacion]: '#E8A87C',
  [ActivityCategory.Entretenimiento]: '#C9A0DC',
  [ActivityCategory.VidaNocturna]: '#7B6BB5',
  [ActivityCategory.Cultura]: '#D4A853',
  [ActivityCategory.Naturaleza]: '#6BAE75',
  [ActivityCategory.Bienestar]: '#87CEEB',
  [ActivityCategory.Compras]: '#E88FA0',
};
