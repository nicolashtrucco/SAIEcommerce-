import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import dotenv from 'dotenv'
import { randomUUID } from 'node:crypto'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import nodemailer from 'nodemailer'
import pg from 'pg'

dotenv.config({ path: 'backend/.env' })
dotenv.config()

const { Pool } = pg

const {
  NODE_ENV = 'development',
  PORT = '3000',
  HOST = '0.0.0.0',
  DATABASE_URL,
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'sai',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  CORS_ORIGIN = '*',
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_STORAGE_BUCKET,
  ADMIN_EMAIL,
  ADMIN_UID,
  MAX_IMAGE_SIZE_MB = '3',
  SMTP_HOST,
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  CONTACT_TO_EMAIL,
} = process.env

const MAX_IMAGE_SIZE_BYTES = Number(MAX_IMAGE_SIZE_MB) * 1024 * 1024
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAIL_LOGO_CID = 'sai-logo'
const MAIL_LOGO_PATH = 'public/LogoBlancoNaranja.png'

const pool = new Pool({
  connectionString:
    DATABASE_URL ||
    `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
})

const app = Fastify({
  logger: NODE_ENV !== 'test',
})

await app.register(cors, {
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await app.register(multipart, {
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
})

app.addHook('preHandler', async (request) => {
  if (request.method !== 'OPTIONS' && request.url.startsWith('/api/admin')) {
    await requireAdmin(request)
  }
})

const mapProductRow = (row) => ({
  id: row.id,
  categoryId: row.category_id,
  category: row.category_name,
  categorySlug: row.category_slug,
  name: row.name,
  code: row.code,
  description: row.description,
  image: row.image_url,
  origin: row.origin,
  condition: row.condition,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapCategoryRow = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapClientRow = (row) => ({
  id: row.id,
  name: row.name,
  logo: row.logo_url,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const createHttpError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getFirebaseApp = () => {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_STORAGE_BUCKET) {
    throw createHttpError(500, 'Firebase no esta configurado.')
  }

  if (!getApps().length) {
    return initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: FIREBASE_STORAGE_BUCKET,
    })
  }

  return getApps()[0]
}

const getFirebaseBucket = () => getStorage(getFirebaseApp()).bucket()

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const normalizeText = (value) => String(value || '').trim()

const CONTACT_INBOX_EMAIL =
  normalizeEmail(CONTACT_TO_EMAIL) || normalizeEmail(SMTP_USER) || 'info@saisistemas.com.ar'
const MAIL_FROM = normalizeText(SMTP_FROM) || `SAI Sistemas <${SMTP_USER}>`

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const createMailLayout = ({ eyebrow, title, intro, body, cta }) => `
  <!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f3f3f3; color: #1f1f1f; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f3f3f3; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 680px; overflow: hidden; border-radius: 28px; background: #ffffff; border: 1px solid rgba(31, 31, 31, 0.08);">
              <tr>
                <td style="background: #050505; padding: 28px 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <img src="cid:${MAIL_LOGO_CID}" alt="SAI Sistemas" width="96" style="display: block; width: 96px; max-width: 96px; height: auto; border: 0;" />
                      </td>
                      <td align="right">
                        <p style="margin: 0; color: #FF9933; font-size: 11px; line-height: 1.4; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase;">
                          Sistemas
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 34px 32px 8px;">
                  <p style="margin: 0 0 18px; color: rgba(31, 31, 31, 0.45); font-size: 11px; line-height: 1.4; font-weight: 400; letter-spacing: 0.22em; text-transform: uppercase;">
                    ${escapeHtml(eyebrow)}
                  </p>
                  <h1 style="margin: 0; color: #1f1f1f; font-size: 38px; line-height: 1.08; font-weight: 300; letter-spacing: -0.055em;">
                    ${escapeHtml(title)}
                  </h1>
                  <p style="margin: 20px 0 0; max-width: 540px; color: rgba(31, 31, 31, 0.68); font-size: 16px; line-height: 1.55; font-weight: 300;">
                    ${escapeHtml(intro)}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 32px 34px;">
                  ${body}
                  ${
                    cta
                      ? `<p style="margin: 28px 0 0;">
                          <a href="${escapeHtml(cta.href)}" style="display: inline-block; background: #1f1f1f; color: #ffffff; padding: 14px 22px; font-size: 11px; line-height: 1; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none;">
                            ${escapeHtml(cta.label)}
                          </a>
                        </p>`
                      : ''
                  }
                </td>
              </tr>
              <tr>
                <td style="border-top: 1px solid rgba(31, 31, 31, 0.08); padding: 22px 32px; background: #ffffff;">
                  <p style="margin: 0; color: rgba(31, 31, 31, 0.45); font-size: 12px; line-height: 1.5; font-weight: 300;">
                    SAI Sistemas - Automatizacion industrial - Rosario, Santa Fe.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const createMailDetailRow = (label, value) => `
  <tr>
    <td style="width: 180px; border-bottom: 1px solid rgba(31, 31, 31, 0.08); padding: 16px 0; color: rgba(31, 31, 31, 0.42); font-size: 11px; line-height: 1.4; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase;">
      ${escapeHtml(label)}
    </td>
    <td style="border-bottom: 1px solid rgba(31, 31, 31, 0.08); padding: 16px 0 16px 18px; color: #1f1f1f; font-size: 16px; line-height: 1.45; font-weight: 300;">
      ${escapeHtml(value)}
    </td>
  </tr>
`

const createMailAttachments = () => [
  {
    filename: 'LogoBlancoNaranja.png',
    path: MAIL_LOGO_PATH,
    cid: MAIL_LOGO_CID,
  },
]

const getMailTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw createHttpError(500, 'El envio de emails no esta configurado.')
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

const createContactAdminEmail = ({ name, email, number, text }) => {
  const phone = number || 'No informado'

  return {
    subject: `Nueva consulta web de ${name}`,
    text: [
      'Nueva consulta recibida desde el sitio web de SAI Sistemas.',
      '',
      `Nombre: ${name}`,
      `Telefono / WhatsApp: ${phone}`,
      `Email: ${email}`,
      '',
      'Mensaje:',
      text,
    ].join('\n'),
    html: createMailLayout({
      eyebrow: '[05] Contacto',
      title: 'Nueva consulta web.',
      intro: 'Se recibio una nueva consulta desde el formulario del sitio. Estos son los datos enviados por la persona interesada.',
      body: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${createMailDetailRow('Nombre', name)}
          ${createMailDetailRow('Telefono / WhatsApp', phone)}
          ${createMailDetailRow('Email', email)}
        </table>
        <div style="margin-top: 26px; padding: 24px; border-radius: 22px; background: #f3f3f3; border: 1px solid rgba(31, 31, 31, 0.08);">
          <p style="margin: 0 0 12px; color: rgba(31, 31, 31, 0.45); font-size: 11px; line-height: 1.4; font-weight: 400; letter-spacing: 0.18em; text-transform: uppercase;">
            Mensaje
          </p>
          <p style="margin: 0; color: #1f1f1f; font-size: 17px; line-height: 1.55; font-weight: 300; white-space: pre-line;">${escapeHtml(text)}</p>
        </div>
      `,
      cta: {
        label: 'Responder consulta',
        href: `mailto:${email}`,
      },
    }),
  }
}

const createContactConfirmationEmail = ({ name }) => ({
  subject: 'Recibimos tu consulta - SAI Sistemas',
  text: [
    `Hola ${name},`,
    '',
    'Recibimos tu consulta correctamente. En breve nuestro equipo se va a contactar para acompañarte con una respuesta precisa.',
    '',
    'Saludos,',
    'SAI Sistemas',
  ].join('\n'),
  html: createMailLayout({
    eyebrow: '[Consulta recibida]',
    title: 'Gracias por contactarnos.',
    intro: `Hola ${name}, recibimos tu consulta correctamente. En breve nuestro equipo se va a contactar para acompanarte con una respuesta precisa.`,
    body: `
      <div style="padding: 24px; border-radius: 22px; background: #f3f3f3; border: 1px solid rgba(31, 31, 31, 0.08);">
        <p style="margin: 0; color: #1f1f1f; font-size: 20px; line-height: 1.35; font-weight: 300; letter-spacing: -0.03em;">
          Nuestro equipo tecnico revisara tu mensaje y te respondera a la brevedad.
        </p>
        <p style="margin: 18px 0 0; color: rgba(31, 31, 31, 0.62); font-size: 15px; line-height: 1.55; font-weight: 300;">
          Si necesitas sumar informacion adicional, podes responder este correo directamente.
        </p>
      </div>
    `,
    cta: {
      label: 'Escribir a SAI',
      href: `mailto:${CONTACT_INBOX_EMAIL}`,
    },
  }),
})

const requireAdmin = async (request) => {
  if (!ADMIN_UID && !ADMIN_EMAIL) {
    throw createHttpError(500, 'El acceso admin no esta configurado.')
  }

  const authorization = request.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    throw createHttpError(401, 'Debes iniciar sesion para acceder al panel.')
  }

  let decodedToken

  try {
    decodedToken = await getAuth(getFirebaseApp()).verifyIdToken(token)
  } catch (_error) {
    throw createHttpError(401, 'La sesion no es valida o expiro.')
  }

  const uidMatches = ADMIN_UID ? decodedToken.uid === ADMIN_UID : true
  const emailMatches = ADMIN_EMAIL ? normalizeEmail(decodedToken.email) === normalizeEmail(ADMIN_EMAIL) : true

  if (!uidMatches || !emailMatches) {
    throw createHttpError(403, 'No tienes permisos para acceder al panel.')
  }
}

const readImagePart = async (part) => {
  if (!VALID_IMAGE_TYPES.includes(part.mimetype)) {
    throw createHttpError(400, 'El archivo debe ser una imagen JPG, PNG, WEBP o GIF.')
  }

  const chunks = []
  let size = 0

  for await (const chunk of part.file) {
    size += chunk.length

    if (size > MAX_IMAGE_SIZE_BYTES) {
      throw createHttpError(413, `La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`)
    }

    chunks.push(chunk)
  }

  return {
    buffer: Buffer.concat(chunks),
    filename: part.filename || 'image',
    mimetype: part.mimetype,
  }
}

const parseMultipartForm = async (request) => {
  const fields = {}
  let image = null

  for await (const part of request.parts()) {
    if (part.file) {
      image = await readImagePart(part)
    } else {
      fields[part.fieldname] = part.value
    }
  }

  return { fields, image }
}

const uploadImageToFirebase = async (folder, image) => {
  const bucket = getFirebaseBucket()
  const extension = image.filename.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${folder}/${Date.now()}-${randomUUID()}.${extension}`
  const downloadToken = randomUUID()
  const file = bucket.file(path)

  await file.save(image.buffer, {
    metadata: {
      contentType: image.mimetype,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
    resumable: false,
  })

  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`
}

const booleanFromForm = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue
  return value === true || value === 'true' || value === '1'
}

app.get('/health', async () => ({ ok: true }))

app.post('/api/contact', async (request, reply) => {
  const { name, number, email, text } = request.body || {}
  const contactData = {
    name: normalizeText(name),
    number: normalizeText(number),
    email: normalizeEmail(email),
    text: normalizeText(text),
  }

  if (!contactData.name || !contactData.email || !contactData.text) {
    throw createHttpError(400, 'Nombre, email y mensaje son obligatorios.')
  }

  if (!isValidEmail(contactData.email)) {
    throw createHttpError(400, 'El email no es valido.')
  }

  const transporter = getMailTransporter()
  const adminEmail = createContactAdminEmail(contactData)
  const confirmationEmail = createContactConfirmationEmail(contactData)

  await Promise.all([
    transporter.sendMail({
      from: MAIL_FROM,
      to: CONTACT_INBOX_EMAIL,
      replyTo: contactData.email,
      attachments: createMailAttachments(),
      ...adminEmail,
    }),
    transporter.sendMail({
      from: MAIL_FROM,
      to: contactData.email,
      replyTo: CONTACT_INBOX_EMAIL,
      attachments: createMailAttachments(),
      ...confirmationEmail,
    }),
  ])

  return reply.code(201).send({ ok: true })
})

app.get('/api/categories', async () => {
  const { rows } = await pool.query(
    `
      SELECT id, name, slug, is_active, created_at, updated_at
      FROM categories
      WHERE is_active = true
      ORDER BY name ASC
    `,
  )

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
})

app.get('/api/products', async (request) => {
  const { category, search } = request.query
  const where = ['p.is_active = true', 'c.is_active = true']
  const values = []
  let index = 1

  if (category && category !== 'Todos') {
    where.push(`(c.slug = $${index} OR c.name ILIKE $${index})`)
    values.push(String(category).trim())
    index += 1
  }

  if (search && String(search).trim() !== '') {
    where.push(`(
      p.name ILIKE $${index}
      OR p.code ILIKE $${index}
      OR p.description ILIKE $${index}
      OR c.name ILIKE $${index}
    )`)
    values.push(`%${String(search).trim()}%`)
  }

  const query = `
    SELECT
      p.id,
      p.category_id,
      p.name,
      p.code,
      p.description,
      p.image_url,
      p.origin,
      p.condition,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.name AS category_name,
      c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY p.name ASC
  `

  const { rows } = await pool.query(query, values)
  return rows.map(mapProductRow)
})

app.get('/api/products/:code', async (request, reply) => {
  const { code } = request.params
  const { rows } = await pool.query(
    `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.code,
        p.description,
        p.image_url,
        p.origin,
        p.condition,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.code ILIKE $1
      LIMIT 1
    `,
    [code],
  )

  if (!rows[0]) {
    return reply.code(404).send({
      message: 'Product not found',
    })
  }

  return mapProductRow(rows[0])
})

app.get('/api/clients', async () => {
  const { rows } = await pool.query(
    `
      SELECT id, name, logo_url, sort_order, is_active, created_at, updated_at
      FROM clients
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `,
  )

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    logo: row.logo_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
})

app.get('/api/admin/categories', async () => {
  const { rows } = await pool.query(
    `
      SELECT id, name, slug, is_active, created_at, updated_at
      FROM categories
      ORDER BY name ASC
    `,
  )

  return rows.map(mapCategoryRow)
})

app.post('/api/admin/categories', async (request, reply) => {
  const { name, slug, isActive } = request.body || {}

  if (!name || String(name).trim() === '') {
    throw createHttpError(400, 'El nombre de la categoria es obligatorio.')
  }

  const normalizedSlug = slugify(slug || name)

  if (!normalizedSlug) {
    throw createHttpError(400, 'El slug de la categoria no es valido.')
  }

  const { rows } = await pool.query(
    `
      INSERT INTO categories (name, slug, is_active)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug, is_active, created_at, updated_at
    `,
    [String(name).trim(), normalizedSlug, isActive ?? true],
  )

  return reply.code(201).send(mapCategoryRow(rows[0]))
})

app.put('/api/admin/categories/:id', async (request, reply) => {
  const { id } = request.params
  const { name, slug, isActive } = request.body || {}

  if (!name || String(name).trim() === '') {
    throw createHttpError(400, 'El nombre de la categoria es obligatorio.')
  }

  const normalizedSlug = slugify(slug || name)

  if (!normalizedSlug) {
    throw createHttpError(400, 'El slug de la categoria no es valido.')
  }

  const { rows } = await pool.query(
    `
      UPDATE categories
      SET name = $1, slug = $2, is_active = $3
      WHERE id = $4
      RETURNING id, name, slug, is_active, created_at, updated_at
    `,
    [String(name).trim(), normalizedSlug, isActive ?? true, id],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Categoria no encontrada.')
  }

  return reply.send(mapCategoryRow(rows[0]))
})

app.delete('/api/admin/categories/:id', async (request, reply) => {
  const { id } = request.params
  const { rows } = await pool.query(
    `
      DELETE FROM categories
      WHERE id = $1
      RETURNING id, name, slug, is_active, created_at, updated_at
    `,
    [id],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Categoria no encontrada.')
  }

  return reply.send(mapCategoryRow(rows[0]))
})

app.get('/api/admin/products', async () => {
  const { rows } = await pool.query(
    `
      SELECT
        p.id,
        p.category_id,
        p.name,
        p.code,
        p.description,
        p.image_url,
        p.origin,
        p.condition,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `,
  )

  return rows.map(mapProductRow)
})

app.post('/api/admin/products', async (request, reply) => {
  const { fields, image } = await parseMultipartForm(request)

  if (!image) {
    throw createHttpError(400, 'La imagen del producto es obligatoria.')
  }

  const imageUrl = await uploadImageToFirebase('products', image)
  const { categoryId, name, code, description, origin, condition, isActive } = fields

  if (!categoryId || !name || !code || !description) {
    throw createHttpError(400, 'Categoria, nombre, codigo y descripcion son obligatorios.')
  }

  const { rows } = await pool.query(
    `
      INSERT INTO products (
        category_id,
        name,
        code,
        description,
        image_url,
        origin,
        condition,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        category_id,
        name,
        code,
        description,
        image_url,
        origin,
        condition,
        is_active,
        created_at,
        updated_at,
        (SELECT name FROM categories WHERE id = products.category_id) AS category_name,
        (SELECT slug FROM categories WHERE id = products.category_id) AS category_slug
    `,
    [
      categoryId,
      String(name).trim(),
      String(code).trim(),
      String(description).trim(),
      imageUrl,
      origin ? String(origin).trim() : null,
      condition || 'Nuevo',
      booleanFromForm(isActive),
    ],
  )

  return reply.code(201).send(mapProductRow(rows[0]))
})

app.put('/api/admin/products/:id', async (request, reply) => {
  const { id } = request.params
  const { fields, image } = await parseMultipartForm(request)
  const { categoryId, name, code, description, origin, condition, isActive } = fields
  let imageUrl = fields.imageUrl || null

  if (!categoryId || !name || !code || !description) {
    throw createHttpError(400, 'Categoria, nombre, codigo y descripcion son obligatorios.')
  }

  if (image) {
    imageUrl = await uploadImageToFirebase('products', image)
  }

  const { rows } = await pool.query(
    `
      UPDATE products
      SET
        category_id = $1,
        name = $2,
        code = $3,
        description = $4,
        image_url = COALESCE($5, image_url),
        origin = $6,
        condition = $7,
        is_active = $8
      WHERE id = $9
      RETURNING
        id,
        category_id,
        name,
        code,
        description,
        image_url,
        origin,
        condition,
        is_active,
        created_at,
        updated_at,
        (SELECT name FROM categories WHERE id = products.category_id) AS category_name,
        (SELECT slug FROM categories WHERE id = products.category_id) AS category_slug
    `,
    [
      categoryId,
      String(name).trim(),
      String(code).trim(),
      String(description).trim(),
      imageUrl,
      origin ? String(origin).trim() : null,
      condition || 'Nuevo',
      booleanFromForm(isActive),
      id,
    ],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Producto no encontrado.')
  }

  return reply.send(mapProductRow(rows[0]))
})

app.delete('/api/admin/products/:id', async (request, reply) => {
  const { id } = request.params
  const { rows } = await pool.query(
    `
      DELETE FROM products
      WHERE id = $1
      RETURNING
        id,
        category_id,
        name,
        code,
        description,
        image_url,
        origin,
        condition,
        is_active,
        created_at,
        updated_at,
        (SELECT name FROM categories WHERE id = products.category_id) AS category_name,
        (SELECT slug FROM categories WHERE id = products.category_id) AS category_slug
    `,
    [id],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Producto no encontrado.')
  }

  return reply.send(mapProductRow(rows[0]))
})

app.get('/api/admin/clients', async () => {
  const { rows } = await pool.query(
    `
      SELECT id, name, logo_url, sort_order, is_active, created_at, updated_at
      FROM clients
      ORDER BY sort_order ASC, name ASC
    `,
  )

  return rows.map(mapClientRow)
})

app.post('/api/admin/clients', async (request, reply) => {
  const { fields, image } = await parseMultipartForm(request)
  const { name, isActive } = fields

  if (!name || String(name).trim() === '') {
    throw createHttpError(400, 'El nombre del cliente es obligatorio.')
  }

  if (!image) {
    throw createHttpError(400, 'El logo del cliente es obligatorio.')
  }

  const logoUrl = await uploadImageToFirebase('clients', image)
  const { rows } = await pool.query(
    `
      INSERT INTO clients (name, logo_url, sort_order, is_active)
      VALUES (
        $1,
        $2,
        (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM clients),
        $3
      )
      RETURNING id, name, logo_url, sort_order, is_active, created_at, updated_at
    `,
    [String(name).trim(), logoUrl, booleanFromForm(isActive)],
  )

  return reply.code(201).send(mapClientRow(rows[0]))
})

app.put('/api/admin/clients/:id', async (request, reply) => {
  const { id } = request.params
  const { fields, image } = await parseMultipartForm(request)
  const { name, isActive } = fields
  let logoUrl = fields.logoUrl || null

  if (!name || String(name).trim() === '') {
    throw createHttpError(400, 'El nombre del cliente es obligatorio.')
  }

  if (image) {
    logoUrl = await uploadImageToFirebase('clients', image)
  }

  const { rows } = await pool.query(
    `
      UPDATE clients
      SET
        name = $1,
        logo_url = COALESCE($2, logo_url),
        is_active = $3
      WHERE id = $4
      RETURNING id, name, logo_url, sort_order, is_active, created_at, updated_at
    `,
    [String(name).trim(), logoUrl, booleanFromForm(isActive), id],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Cliente no encontrado.')
  }

  return reply.send(mapClientRow(rows[0]))
})

app.delete('/api/admin/clients/:id', async (request, reply) => {
  const { id } = request.params
  const { rows } = await pool.query(
    `
      DELETE FROM clients
      WHERE id = $1
      RETURNING id, name, logo_url, sort_order, is_active, created_at, updated_at
    `,
    [id],
  )

  if (!rows[0]) {
    throw createHttpError(404, 'Cliente no encontrado.')
  }

  return reply.send(mapClientRow(rows[0]))
})

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error)
  const statusCode = error.statusCode || 500
  const messageByCode = {
    '23503': 'No se puede completar la operacion porque hay datos relacionados.',
    '23505': 'Ya existe un registro con esos datos.',
    '23514': 'Alguno de los valores no cumple las reglas permitidas.',
  }

  reply.code(statusCode).send({
    message: messageByCode[error.code] || error.message || 'Internal server error',
  })
})

const start = async () => {
  try {
    await app.listen({
      host: HOST,
      port: Number(PORT),
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()

const gracefulShutdown = async () => {
  try {
    await app.close()
    await pool.end()
    process.exit(0)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
