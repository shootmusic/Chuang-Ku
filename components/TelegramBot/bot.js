/**
 * DOKUMENTASI BOT COMMANDS
 * Bot dijalankan via webhook di app/api/telegram/webhook/route.js
 * File ini hanya referensi command dan format pesan
 */

export const BOT_COMMANDS = [
  { command: 'start', description: 'Mulai bot & lihat info akun' },
  { command: 'id', description: 'Cek Telegram ID kamu' },
]

export const BOT_FORMATS = {
  // Buyer kirim alamat pengiriman
  address: 'ALAMAT#[ORDER_NUMBER]#[Nama, Jalan, Kel, Kec, Kota, Provinsi, Kodepos, No HP]',
  // Seller input nomor resi
  tracking: 'RESI#[ORDER_NUMBER]#[NAMA_KURIR]#[NOMOR_RESI]',
  // Cek status order
  checkOrder: 'Ketik order number, contoh: CK1234567890ABCD',
}

export const ORDER_STATUS = {
  pending: 'Menunggu pembayaran',
  waiting_confirmation: 'Bukti bayar diterima, menunggu konfirmasi seller',
  confirmed: 'Pembayaran dikonfirmasi',
  waiting_address: 'Menunggu alamat pengiriman (produk fisik)',
  processing: 'Alamat diterima, seller memproses',
  shipped: 'Sudah dikirim',
  delivered: 'Sudah diterima',
  rejected: 'Pembayaran ditolak',
}
