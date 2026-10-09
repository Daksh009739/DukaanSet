/** Fictional source records, preserved across languages; never copied into merchant data. */
export const publicBusinessKeys=['grocery','hardware','vegetables','mobile','clothing','general'] as const;
export type PublicBusinessKey=typeof publicBusinessKeys[number];
export const publicExamples={
 grocery:{name:'Annapurna Kirana',sales:'6,840',collected:'5,940',bills:24,credit:'3,250',products:[{name:'Aashirvaad atta · 5 kg',unit:'packet',quantity:4},{name:'Toor dal',unit:'kg',quantity:18.5},{name:'Sunflower oil',unit:'litre',quantity:12}]},
 hardware:{name:'Setu Hardware',sales:'12,450',collected:'9,450',bills:11,credit:'8,600',products:[{name:'PVC pipe · ¾ inch',unit:'pcs',quantity:6},{name:'Hex bolt · M8',unit:'pcs',quantity:240},{name:'Copper wire',unit:'metre',quantity:85}]},
 vegetables:{name:'Hariyali Fresh',sales:'4,280',collected:'4,100',bills:39,credit:'680',products:[{name:'Tomatoes',unit:'kg',quantity:6.5},{name:'Potatoes',unit:'kg',quantity:24},{name:'Bananas',unit:'dozen',quantity:8}]},
 mobile:{name:'Connect Mobile',sales:'7,950',collected:'7,950',bills:16,credit:'1,200',products:[{name:'USB-C cable',unit:'pcs',quantity:3},{name:'Phone cover · black',unit:'pcs',quantity:14},{name:'Screen protector',unit:'pcs',quantity:28}]},
 clothing:{name:'Everyday Threads',sales:'9,600',collected:'8,400',bills:12,credit:'2,450',products:[{name:'Cotton shirt · M · white',unit:'pcs',quantity:3},{name:'Denim · 32 · blue',unit:'pcs',quantity:8},{name:'Everyday kurta · L',unit:'pcs',quantity:12}]},
 general:{name:'Neighbourhood Store',sales:'5,200',collected:'4,700',bills:18,credit:'1,850',products:[{name:'A5 notebook',unit:'pcs',quantity:4},{name:'Water bottle',unit:'pcs',quantity:16},{name:'AA batteries · 2',unit:'packet',quantity:22}]},
} as const;
