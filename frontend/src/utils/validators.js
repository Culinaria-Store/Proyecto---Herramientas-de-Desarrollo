// utils/validator.js

/**
 * Valida que un campo no esté vacío
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida el formato de email
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'El correo electrónico es requerido' };
  }
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)' };
  }
  return { isValid: true, error: '' };
};

  /**
   * Valida la contraseña
   * Requisitos: mínimo 6 caracteres
   */ 
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Debe incluir al menos una letra mayúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Debe incluir al menos un número' };
  }
  return { isValid: true, error: '' };
};
/**
 * Valida nombre o apellido (solo letras, espacios y acentos básicos)
 */
export const validateName = (name, fieldName = 'Nombre') => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} es requerido` };
  }
  const nameRegex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50}$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, error: `${fieldName} debe tener entre 2 y 50 caracteres y solo puede contener letras y espacios` };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida la cantidad de un producto en el carrito
 */
export const validateCartQuantity = (quantity, stock) => {
  if (!quantity || quantity < 1) {
    return { isValid: false, error: 'La cantidad debe ser al menos 1' };
  }
  if (quantity > stock) {
    return { isValid: false, error: `Stock insuficiente. Solo hay ${stock} unidades disponibles` };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida que el carrito no esté vacío
 */
export const validateCartNotEmpty = (items) => {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'El carrito está vacío' };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida todos los items del carrito (stock y cantidades)
 */
export const validateCartItems = (items) => {
  const errors = {};
  
  items.forEach(item => {
    const quantityValidation = validateCartQuantity(item.cantidad, item.stock);
    if (!quantityValidation.isValid) {
      errors[item.id_producto] = quantityValidation.error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida todos los campos del formulario de registro
 */
export const validateRegisterForm = (formData) => {
  const errors = {};
  
  const nombreValidation = validateName(formData.nombre, 'Nombre');
  if (!nombreValidation.isValid) errors.nombre = nombreValidation.error;
  
  const apellidoValidation = validateName(formData.apellido, 'Apellido');
  if (!apellidoValidation.isValid) errors.apellido = apellidoValidation.error;
  
  const emailValidation = validateEmail(formData.correo);
  if (!emailValidation.isValid) errors.correo = emailValidation.error;
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.error;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Función genérica para manejar errores de validación en tiempo real
 */
export const getFieldError = (value, fieldType, fieldName) => {
  switch (fieldType) {
    case 'nombre':
    case 'apellido':
      return validateName(value, fieldName);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    default:
      return validateRequired(value, fieldName);
  }
};

// utils/validator.js (Añadir estas nuevas funciones)

/**
 * Valida los datos de un producto
 */
export const validateProduct = (productData) => {
  const errors = {};
  
  // Validar nombre del producto
  if (!productData.nombre_producto || productData.nombre_producto.trim() === '') {
    errors.nombre_producto = 'El nombre del producto es requerido';
  } else if (productData.nombre_producto.length < 3) {
    errors.nombre_producto = 'El nombre debe tener al menos 3 caracteres';
  } else if (productData.nombre_producto.length > 150) {
    errors.nombre_producto = 'El nombre no puede exceder 150 caracteres';
  }
  
  // Validar precio
  if (!productData.precio && productData.precio !== 0) {
    errors.precio = 'El precio es requerido';
  } else if (isNaN(productData.precio) || parseFloat(productData.precio) <= 0) {
    errors.precio = 'El precio debe ser un número mayor a 0';
  }
  
  // Validar stock
  if (productData.stock === '' || productData.stock === null || productData.stock === undefined) {
    errors.stock = 'El stock es requerido';
  } else if (isNaN(productData.stock) || parseInt(productData.stock) < 0) {
    errors.stock = 'El stock debe ser un número mayor o igual a 0';
  }
  
  // Validar categoría
  if (productData.id_categoria && isNaN(productData.id_categoria)) {
    errors.id_categoria = 'La categoría debe ser un número válido';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida archivo de imagen
 */
export const validateImage = (file, required = false) => {
  if (!file && !required) {
    return { isValid: true, error: '' };
  }
  
  if (!file && required) {
    return { isValid: false, error: 'La imagen es requerida' };
  }
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato no válido. Usa JPG, PNG, WEBP o GIF.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'La imagen no debe superar los 5MB.' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Valida ID de usuario para eliminación
 */
export const validateUserId = (id) => {
  if (!id) {
    return { isValid: false, error: 'ID de usuario no válido' };
  }
  if (isNaN(id) || parseInt(id) <= 0) {
    return { isValid: false, error: 'ID de usuario inválido' };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida que no se pueda eliminar el propio usuario
 */
export const canDeleteUser = (userIdToDelete, currentUserId) => {
  if (parseInt(userIdToDelete) === parseInt(currentUserId)) {
    return { isValid: false, error: 'No puedes eliminar tu propia cuenta' };
  }
  return { isValid: true, error: '' };
};

/**
 * Valida el formulario de pago y facturación (Checkout Completo)
 */
export const validateCheckoutForm = ({ tipoPago, numeroPago, nombreTitular, fechaExpiracion, cvv, sucursalId, tipoComprobante, ruc, razonSocial, direccion }) => {
  const errors = {};

  // 1. Validar Datos de Entrega/Facturación
  if (!sucursalId || sucursalId.trim() === '') {
    errors.sucursalId = 'Debe seleccionar una sucursal.';
  }
  if (!direccion || direccion.trim().length < 5) {
    errors.direccion = 'Ingrese una dirección de facturación/entrega válida.';
  }

  // 2. Validar Tipo de Comprobante
  if (tipoComprobante === 'FACTURA') {
    if (!ruc || !/^(10|20)\d{9}$/.test(ruc.trim())) {
      errors.ruc = 'El RUC debe tener 11 dígitos y comenzar con 10 o 20.';
    }
    if (!razonSocial || razonSocial.trim() === '') {
      errors.razonSocial = 'La Razón Social es obligatoria para Factura.';
    }
  }

  // 3. Validar Pasarela de Pago Simulada
  if (tipoPago === 'YAPE') {
    if (!numeroPago || !/^9\d{8}$/.test(numeroPago.trim())) {
      errors.numeroPago = 'Número de Yape inválido. Debe tener 9 dígitos y comenzar con 9.';
    }
  } else if (tipoPago === 'TARJETA') {
    // Validar Número
    if (!numeroPago || !/^\d{16}$/.test(numeroPago.replace(/\s+/g, ''))) {
      errors.numeroPago = 'Número de tarjeta inválido (16 dígitos).';
    }
    // Validar Nombre
    if (!nombreTitular || nombreTitular.trim().length < 3) {
      errors.nombreTitular = 'El nombre del titular es obligatorio.';
    }
    // Validar Fecha (MM/AA)
    if (!fechaExpiracion || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(fechaExpiracion.trim())) {
      errors.fechaExpiracion = 'Formato inválido. Use MM/AA (ej. 12/25).';
    }
    // Validar CVV (3 o 4 dígitos para Amex)
    if (!cvv || !/^\d{3,4}$/.test(cvv.trim())) {
      errors.cvv = 'CVV inválido (3 o 4 dígitos).';
    }
  }

  return errors;
};