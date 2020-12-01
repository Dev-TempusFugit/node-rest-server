// ========================
//  Puerto
// ========================

process.env.PORT = process.env.PORT || 3000;


// ========================
//  ENTORNO
// ========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ========================
//  Vencimiento del token
// ========================
// 60 s
// 60 min
// 24 h
// 30 d

process.env.TOKEN_EXPIRES = '30d';

// ========================
//  SEED
// ========================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ========================
//  Base de datos
// ========================

let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.DB_URI;
}

process.env.URL_DB = urlDB;