// =============================================================================
// SEEDER K-BURGER TIC
// Uso:  npm run seed
// ATENCIÓN: sync({ force: true }) BORRA y recrea todas las tablas.
// =============================================================================
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Plato, Pedido, PlatoXPedido } = require('../models');

const diasAtras = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('Tablas recreadas.');

    // ---- USUARIOS ----------------------------------------------------------
    // bcrypt.hash(passwordPlano, saltRounds):
    //  - genera un "salt" aleatorio y lo mezcla con la contraseña,
    //  - saltRounds = 10 significa 2^10 rondas de cómputo (costo) para que
    //    calcular el hash sea lento y resista ataques de fuerza bruta,
    //  - devuelve un string de ~60 chars que incluye salt + hash.
    // Es de una sola vía: no se puede "desencriptar", solo comparar con
    // bcrypt.compare(passwordPlano, hash) (se usa en el login, Fase 2).
    const SALT_ROUNDS = 10;
    const [admin, cliente1, cliente2] = await Usuario.bulkCreate([
      {
        nombre: 'Admin',
        apellido: 'KBurger',
        email: 'admin@kburger.tic',
        password: await bcrypt.hash('Admin1234', SALT_ROUNDS),
        admin: true,
      },
      {
        nombre: 'Min-jun',
        apellido: 'Kim',
        email: 'cliente@kburger.tic',
        password: await bcrypt.hash('Cliente1234', SALT_ROUNDS),
        admin: false,
      },
      {
        nombre: 'Sofía',
        apellido: 'Pérez',
        email: 'sofia@kburger.tic',
        password: await bcrypt.hash('Cliente1234', SALT_ROUNDS),
        admin: false,
      },
    ]);

    // ---- PLATOS (5 principales + 3 combos + 2 postres = 10) ----------------
    const platos = await Plato.bulkCreate([
      // Principales
      { tipo: 'principal', nombre: 'K-BBQ Bul Sae Burger', precio: 9500,
        descripcion: 'Medallón de carne marinada estilo bulgogi, cebolla caramelizada, lechuga crujiente y mayo de sésamo en pan brioche.' },
      { tipo: 'principal', nombre: 'Kimchi Crunch Smash', precio: 9000,
        descripcion: 'Doble smash de carne con kimchi crocante, queso cheddar fundido y salsa gochujang suave en pan de papa.' },
      { tipo: 'principal', nombre: 'Teriyaki Glazed Crispy', precio: 9200,
        descripcion: 'Pollo crispy bañado en glaseado teriyaki, repollo morado, pepino encurtido y mayonesa de wasabi.' },
      { tipo: 'principal', nombre: 'Gochujang Double Cheese', precio: 10500,
        descripcion: 'Doble carne, doble cheddar, bacon ahumado y salsa gochujang picante con un toque de miel.' },
      { tipo: 'principal', nombre: 'Asian Pulled Pork Bao Burger', precio: 11000,
        descripcion: 'Cerdo desmechado de cocción lenta en salsa hoisin, pan bao al vapor, zanahoria encurtida y cilantro fresco.' },
      // Combos
      { tipo: 'combo', nombre: 'Combo Seoul Street', precio: 14500,
        descripcion: 'K-BBQ Bul Sae Burger + K-Fries con salsa cheddar y gochugaru + bebida a elección.' },
      { tipo: 'combo', nombre: 'Combo Gangnam Night', precio: 15500,
        descripcion: 'Kimchi Crunch Smash + 5 dumplings de cerdo y cebollín + bebida a elección.' },
      { tipo: 'combo', nombre: 'Combo K-Style Chicken', precio: 14000,
        descripcion: 'Teriyaki Glazed Crispy + nuggets de pollo coreano con salsa dulce picante + bebida a elección.' },
      // Postres
      { tipo: 'postre', nombre: 'Bingsu de Frutilla y Mochi', precio: 6500,
        descripcion: 'Hielo nevado coreano con frutillas frescas, leche condensada y bolitas de mochi.' },
      { tipo: 'postre', nombre: 'Matcha Ice Cream Waffle', precio: 6000,
        descripcion: 'Waffle caliente con helado de té matcha, porotos rojos dulces y crocante de sésamo negro.' },
    ]);

    // Helper: busca un plato por nombre para no depender de los ids.
    const p = (nombre) => platos.find((x) => x.nombre === nombre);

    // ---- PEDIDOS DE PRUEBA (cubren los 4 estados para el Dashboard) --------
    const pedidosSeed = [
      { usuario: cliente1, fecha: diasAtras(3), estado: 'entregado',
        items: [['Combo Seoul Street', 2], ['Bingsu de Frutilla y Mochi', 1]] },
      { usuario: cliente2, fecha: diasAtras(2), estado: 'entregado',
        items: [['Kimchi Crunch Smash', 2], ['Matcha Ice Cream Waffle', 2], ['Gochujang Double Cheese', 1]] },
      { usuario: cliente1, fecha: diasAtras(1), estado: 'en camino',
        items: [['Combo Gangnam Night', 1], ['Asian Pulled Pork Bao Burger', 1]] },
      { usuario: cliente2, fecha: new Date(), estado: 'pendiente',
        items: [['Teriyaki Glazed Crispy', 3], ['Combo K-Style Chicken', 1]] },
    ];

    for (const ped of pedidosSeed) {
      const pedido = await Pedido.create({
        id_usuario: ped.usuario.id,
        fecha: ped.fecha,
        estado: ped.estado,
      });
      // Filas en la tabla pivote PlatosXPedidos (con la cantidad de cada plato).
      await PlatoXPedido.bulkCreate(
        ped.items.map(([nombre, cantidad]) => ({
          id_pedido: pedido.id,
          id_plato: p(nombre).id,
          cantidad,
        }))
      );
    }

    console.log('Seed completado: 3 usuarios, 10 platos, 4 pedidos.');
    console.log(`Admin   -> ${admin.email} / Admin1234`);
    console.log('Cliente -> cliente@kburger.tic / Cliente1234');
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando el seed:', error);
    process.exit(1);
  }
};

seed();
