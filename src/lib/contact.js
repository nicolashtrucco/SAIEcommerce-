const WHATSAPP_NUMBER = '543414707005'

export const getWhatsappUrl = (message) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}

export const getProductInquiryUrl = (productName) =>
  getWhatsappUrl(`Hola, quiero consultar por ${productName}.`)

export const CONTACT_PHONE = {
  label: 'Teléfono / Whatsapp',
  value: '(+54) 0341 - 470 7005',
  href: getWhatsappUrl(),
  isExternal: true,
}

export const CONTACT_EMAIL = {
  label: 'Email',
  value: 'info@saisistemas.com.ar',
  href: 'mailto:info@saisistemas.com.ar',
  isExternal: false,
}

export const CONTACT_ADDRESS = {
  label: 'Dirección',
  value: 'Santa Fe 7940, Rosario, Santa Fe. Argentina.',
  href: 'https://www.google.com/maps/search/?api=1&query=Santa%20Fe%207940%2C%20Rosario%2C%20Santa%20Fe%2C%20Argentina',
  isExternal: true,
}

export const contactChannels = [CONTACT_PHONE, CONTACT_EMAIL, CONTACT_ADDRESS]
