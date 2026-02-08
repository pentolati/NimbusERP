# ERP Nimbus - Prototype v1.0

Prototype frontend untuk sistem ERP Nimbus.

## Fitur

### Dashboard
- Overview ringkasan sistem

### Master Data
- **Warehouse** - Manajemen data gudang
- **Supplier** - Manajemen data supplier
- **Item** - Manajemen data barang/item
- **UOM** - Unit of Measure (satuan ukur)
- **Inventory** - Manajemen stok inventori

### Procurement
- **Purchase Order** - Pembuatan dan manajemen PO

### Settings
- **User Management** - Manajemen pengguna sistem
- **Functional Roles** - Pengaturan role/peran fungsional
- **Document Status** - Pengaturan status dokumen
- **Workflow Transitions** - Konfigurasi alur kerja dokumen

## Teknologi

- HTML5
- CSS3 (dengan CSS Variables untuk theming)
- Vanilla JavaScript
- Light/Dark mode toggle

## Cara Menjalankan

1. Buka file `index.html` di browser
2. Atau gunakan local server:
   ```bash
   # Python
   python -m http.server 8080

   # Node.js
   npx serve
   ```

## Struktur Folder

```
prototype/
├── index.html          # Halaman utama
├── css/
│   ├── variables.css   # CSS variables & theming
│   ├── base.css        # Base styles
│   ├── layout.css      # Layout & grid
│   ├── components.css  # Komponen UI
│   ├── forms.css       # Form styles
│   ├── tables.css      # Table styles
│   └── modals.css      # Modal styles
└── js/
    ├── app.js          # Inisialisasi aplikasi
    ├── data.js         # Mock data
    ├── utils.js        # Utility functions
    ├── navigation.js   # Navigasi sidebar
    ├── dashboard.js    # Modul dashboard
    ├── warehouse.js    # Modul warehouse
    ├── supplier.js     # Modul supplier
    ├── item.js         # Modul item
    ├── uom.js          # Modul UOM
    ├── inventory.js    # Modul inventory
    ├── po.js           # Modul Purchase Order
    ├── user.js         # Modul user management
    └── workflow.js     # Modul workflow
```

## License

Proprietary - All rights reserved
