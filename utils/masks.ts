
export const maskPhone = (value: string | undefined): string => {
  if (!value) return "";
  
  // Remove tudo que não é dígito
  let v = value.replace(/\D/g, "");
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  if (v.length > 11) v = v.slice(0, 11);

  // Formato (XX) XXXXX-XXXX
  if (v.length > 10) {
    return v.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  }
  // Formato (XX) XXXX-XXXX
  else if (v.length > 5) {
    return v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  }
  // Formato (XX) ...
  else if (v.length > 2) {
    return v.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  }
  
  return v;
};

export const maskCpfCnpj = (value: string | undefined): string => {
  if (!value) return "";
  
  // Remove tudo que não é dígito
  let v = value.replace(/\D/g, "");
  
  // Limita a 14 dígitos (CNPJ)
  if (v.length > 14) v = v.slice(0, 14);

  // CNPJ: 00.000.000/0000-00
  if (v.length > 11) {
    return v
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } 
  // CPF: 000.000.000-00
  else {
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
};
