import { PRODUCT_LIMITS } from 'src/app/client/components/test-form/product-validation.constants';

export const GLOBAL_ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required.',
  minlength: 'Too short.',
  maxlength: 'Too long.',
};

export const CONTROL_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  name: {
    required: 'Name is required.',
    minlength: `Name is too short, minimum ${PRODUCT_LIMITS.NAME.MIN_LENGTH} characters.`,
    maxlength: `Name is too long, maximum ${PRODUCT_LIMITS.NAME.MAX_LENGTH} characters.`,
  },
  sku: {
    required: 'Sku is required.',
    minlength: `Sku is too short, minimum ${PRODUCT_LIMITS.SKU.MIN_LENGTH} characters.`,
    maxlength: `Sku is too long, maximum ${PRODUCT_LIMITS.SKU.MAX_LENGTH} characters.`,
  },
  password: {
    required: 'Password is required.',
    minlength: 'Password must be at least 8 characters.',
  },
  tags: {
    emptyTag: 'Tags cannot be empty.',
    duplicateTag: 'Tags must be unique.',
  },
  description:{
    minlength: `Description is too short, minimum ${PRODUCT_LIMITS.DESCRIPTION.MIN_LENGTH} characters.`,
    maxlength: `Description is too long, maximum ${PRODUCT_LIMITS.DESCRIPTION.MAX_LENGTH} characters.`
  },
   shortDescription:{
    minlength: `The short description is too short, minimum ${PRODUCT_LIMITS.SHORT_DESCRIPTION.MIN_LENGTH} characters.`,
    maxlength: `The short description is too long, maximum ${PRODUCT_LIMITS.SHORT_DESCRIPTION.MAX_LENGTH} characters.`
  }
};
