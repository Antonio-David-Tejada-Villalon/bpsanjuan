require('dotenv').config({ path: '../.env' });
// Si el .env está en server/
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const News = require('../models/News');
const Library = require('../models/Library');

// ─── Datos de los 19 departamentos de San Juan ────────────────────────────
const departments = [
  { name: 'Capital', slug: 'capital', description: 'Bibliotecas Populares en la Capital de San Juan.', thumbnail: 'https://i.ibb.co/gF78QGw4/capital.jpg' },
  { name: 'Rawson', slug: 'rawson', description: 'Bibliotecas Populares en el Departamento de Rawson.', thumbnail: 'https://i.ibb.co/f9SXYNQ/rawson.jpg' },
  { name: 'Chimbas', slug: 'chimbas', description: 'Bibliotecas Populares en el Departamento de Chimbas.', thumbnail: 'https://i.ibb.co/0JC47d2/3.jpg' },
  { name: 'Rivadavia', slug: 'rivadavia', description: 'Bibliotecas Populares en el Departamento de Rivadavia.', thumbnail: 'https://i.ibb.co/XsRXBYR/4.jpg' },
  { name: 'Santa Lucía', slug: 'santa-lucia', description: 'Bibliotecas Populares en el Departamento de Santa Lucía.', thumbnail: 'https://i.ibb.co/7Chyccr/5.jpg' },
  { name: 'Pocito', slug: 'pocito', description: 'Bibliotecas Populares en el Departamento de Pocito.', thumbnail: 'https://i.ibb.co/8YqsY98/6.jpg' },
  { name: 'Caucete', slug: 'caucete', description: 'Bibliotecas Populares en el Departamento de Caucete.', thumbnail: 'https://i.ibb.co/FW6s46d/7.jpg' },
  { name: 'Jáchal', slug: 'jachal', description: 'Bibliotecas Populares en el Departamento de Jáchal.', thumbnail: 'https://i.ibb.co/2qtsSvY/8.jpg' },
  { name: 'Albardón', slug: 'albardon', description: 'Bibliotecas Populares en el Departamento de Albardón.', thumbnail: 'https://i.ibb.co/vsKTyLm/9.jpg' },
  { name: 'Sarmiento', slug: 'sarmiento', description: 'Bibliotecas Populares en el Departamento de Sarmiento.', thumbnail: 'https://i.ibb.co/CsnwnpW/19.jpg' },
  { name: '25 de Mayo', slug: '25-de-mayo', description: 'Bibliotecas Populares en el Departamento de 25 de Mayo.', thumbnail: 'https://i.ibb.co/jMjVq0Y/10.jpg' },
  { name: 'San Martín', slug: 'san-martin', description: 'Bibliotecas Populares en el Departamento de San Martín.', thumbnail: 'https://i.ibb.co/7jf869n/11.jpg' },
  { name: 'Calingasta', slug: 'calingasta', description: 'Bibliotecas Populares en el Departamento de Calingasta.', thumbnail: 'https://i.ibb.co/MBgM4mB/12.jpg' },
  { name: '9 de Julio', slug: '9-de-julio', description: 'Bibliotecas Populares en el Departamento de 9 de Julio.', thumbnail: 'https://i.ibb.co/1bK9D7m/13.jpg' },
  { name: 'Angaco', slug: 'angaco', description: 'Bibliotecas Populares en el Departamento de Angaco.', thumbnail: 'https://i.ibb.co/C68bCkK/14.jpg' },
  { name: 'Valle Fértil', slug: 'valle-fertil', description: 'Bibliotecas Populares en el Departamento de Valle Fértil.', thumbnail: 'https://i.ibb.co/5F651S7/15.jpg' },
  { name: 'Iglesia', slug: 'iglesia', description: 'Bibliotecas Populares en el Departamento de Iglesia.', thumbnail: 'https://i.ibb.co/QkyYWry/16.jpg' },
  { name: 'Ullum', slug: 'ullum', description: 'Bibliotecas Populares en el Departamento de Ullum.', thumbnail: 'https://i.ibb.co/pZsdV3Y/17.jpg' },
  { name: 'Zonda', slug: 'zonda', description: 'Bibliotecas Populares en el Departamento de Zonda.', thumbnail: 'https://i.ibb.co/RH1Q9wD/18.jpg' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Conectado a MongoDB Atlas');

    // ─── Limpiar colecciones ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      News.deleteMany({}),
      Library.deleteMany({})
    ]);
    console.log('🗑️  Colecciones limpiadas');

    // ─── Crear usuario admin ───────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bpsanjuan.ar';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin12345!';

    const admin = await User.create({
      name: 'Administrador',
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });
    console.log(`👤 Admin creado: ${adminEmail}`);

    // ─── Crear departamentos ───────────────────────────────────────────────
    const createdDepts = await Department.insertMany(departments);
    console.log(`🏛️  ${createdDepts.length} departamentos creados`);

    // ─── Crear noticias de ejemplo (migradas desde data.json original) ─────
    const capitalDept = createdDepts.find(d => d.slug === 'capital');
    const newsData = [
      {
        title: 'Apertura de Biblioteca de Autores Sanjuaninos',
        summary: '22 de Septiembre - Apertura oficial de la Biblioteca de Autores Sanjuaninos en San Juan.',
        content: '<p>El 22 de Septiembre se realizó la apertura oficial de la Biblioteca de Autores Sanjuaninos, un espacio dedicado a preservar y difundir la obra literaria de escritores de la provincia de San Juan.</p>',
        thumbnail: 'https://i.ibb.co/YNtGYPX/ortada-biblioteca.jpg',
        isPublished: true,
        author: admin._id,
        relatedDepartment: capitalDept?._id || null
      },
      {
        title: 'Leer Memoria - Día de las Bibliotecas Populares',
        summary: '23 de Septiembre - Día de las Bibliotecas Populares. Actividades en toda la provincia.',
        content: '<p>El 23 de Septiembre, Día de las Bibliotecas Populares, se realizaron diversas actividades culturales en todas las bibliotecas de la provincia de San Juan.</p>',
        thumbnail: 'https://i.ibb.co/xhqW3jC/23-DE-SEPTIEMBRE-DIA-DE-LAS-BIBLIOTECAS.jpg',
        isPublished: true,
        author: admin._id
      },
      {
        title: 'Mariana Enriquez: Maestría Argentina en el Terror y el Realismo Gótico',
        summary: 'Descubriendo los abismos de lo macabro y lo sobrenatural a través de la pluma de una escritora vanguardista.',
        content: '<p>Mariana Enriquez es una de las escritoras argentinas más destacadas de la literatura contemporánea, reconocida internacionalmente por sus cuentos de terror y realismo gótico.</p>',
        thumbnail: 'https://i.ibb.co/xL25g9T/1.webp',
        isPublished: true,
        author: admin._id
      },
      {
        title: 'Picnic Cultural en Los Pinos - Chimbas',
        summary: 'Actividades culturales con las Bibliotecas Populares en el Parque Los Pinos, Chimbas.',
        content: '<p>Las Bibliotecas Populares del departamento de Chimbas organizaron un Picnic Cultural en el Parque Los Pinos, con actividades para toda la familia.</p>',
        thumbnail: 'https://i.ibb.co/yfG2C6N/flayer.jpg',
        isPublished: true,
        author: admin._id
      },
      {
        title: 'Picnic Cultural en Villa Aberastain - Pocito',
        summary: '¡El Bibliomóvil llegó al departamento de Pocito! Actividades para toda la comunidad.',
        content: '<p>El Bibliomóvil visitó el departamento de Pocito, llevando actividades culturales y promoviendo la lectura en la comunidad de Villa Aberastain.</p>',
        thumbnail: 'https://i.ibb.co/McPyjk4/flyer.jpg',
        isPublished: true,
        author: admin._id
      }
    ];

    const createdNews = await News.insertMany(newsData);
    console.log(`📰 ${createdNews.length} noticias creadas`);

    // ─── Crear bibliotecas de ejemplo (migradas desde el sitio original) ───
    const rawsonDept = createdDepts.find(d => d.slug === 'rawson');

    const librariesData = [
      {
        name: 'Biblioteca Infantil Provincial Juan Pablo Echagüe',
        department: capitalDept?._id,
        address: { street: '25 de Mayo 463 (Oeste)', locality: 'Capital' },
        contact: { website: 'http://bibechague.bepe.ar' },
        schedule: [
          { day: 'Lunes a Viernes', open: '07:30', close: '14:00' },
          { day: 'Lunes a Viernes', open: '14:00', close: '21:00' }
        ],
        thumbnail: 'https://i.ibb.co/1Qp8x9F/IMG-20240202-081558548-MFNR-Nadia-Bula.jpg',
        conabipRegistered: true
      },
      {
        name: 'Americas',
        department: capitalDept?._id,
        address: { street: 'Santa Fé 136 (Oeste)', locality: 'Capital' },
        contact: { email: 'asic_americas@yahoo.com.ar', website: 'http://3213.bepe.ar/' },
        foundedYear: 1956,
        thumbnail: 'https://i.ibb.co/gz83spL/Whats-App-Image-2023-08-02-at-14-58-37.jpg',
        conabipRegistered: true
      },
      {
        name: 'Alfonsina Storni',
        department: rawsonDept?._id,
        address: { street: 'Bahía Blanca y Paso de Los Andes - CIC de Villa Angélica (Oeste)', locality: 'Rawson' },
        contact: { email: 'alfonsinastorni.rawsonsj@gmail.com', phone: '264-4340611', website: 'http://4093.bepe.ar/' },
        schedule: [{ day: 'Lunes a Viernes', open: '09:00', close: '12:00' }],
        foundedYear: 2003,
        thumbnail: 'https://i.ibb.co/JzVMGBK/Whats-App-Image-2023-08-03-at-12-15-53.jpg',
        conabipRegistered: true
      },
      {
        name: 'B° Victoria',
        department: rawsonDept?._id,
        address: { street: 'Guayaquil y José Ingenieros. Bº Hualilán (Sur)', locality: 'Rawson' },
        contact: { email: 'bp_barriovictoria@hotmail.com', website: 'http://4263.bepe.ar/' },
        schedule: [{ day: 'Lunes, Miércoles y Viernes', open: '09:00', close: '11:00' }],
        foundedYear: 2009,
        thumbnail: 'https://i.ibb.co/8xsMftC/Whats-App-Image-2023-08-02-at-14-46-55.jpg',
        conabipRegistered: true
      }
    ].filter(lib => lib.department);

    const createdLibraries = await Library.insertMany(librariesData);
    console.log(`📚 ${createdLibraries.length} bibliotecas creadas`);

    console.log('\n✅ ¡Base de datos inicializada correctamente!');
    console.log('─────────────────────────────────────');
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`🔑 Admin password: ${adminPassword}`);
    console.log('─────────────────────────────────────');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña del admin después del primer login.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
    process.exit(1);
  }
};

seedDB();
