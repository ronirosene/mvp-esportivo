const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Data Migration: Sport + EventSport ===\n');

  // 1. Collect all existing Sports
  const allSports = await prisma.sport.findMany({ include: { eventSports: true } });
  console.log(`Found ${allSports.length} existing sports`);

  // Build mapping: nome -> unique entries (deduplicate)
  const nomeGroups = new Map();
  for (const s of allSports) {
    if (!nomeGroups.has(s.nome)) nomeGroups.set(s.nome, []);
    nomeGroups.get(s.nome).push(s);
  }

  const nomeToSportId = new Map(); // nome -> canonical sport id

  for (const [nome, group] of nomeGroups) {
    if (group.length === 1) {
      // Single entry, no dedup needed
      const s = group[0];
      nomeToSportId.set(nome, s.id);
      // Ensure ativo = true
      await prisma.sport.update({ where: { id: s.id }, data: { ativo: true } });
      console.log(`  Kept: ${nome} (${s.id})`);
    } else {
      // Multiple entries with same nome - merge into first, reassign others
      console.log(`  Deduplicating: ${nome} (${group.length} entries)`);
      const keep = group[0];
      const remove = group.slice(1);
      nomeToSportId.set(nome, keep.id);
      await prisma.sport.update({ where: { id: keep.id }, data: { ativo: true } });

      for (const dup of remove) {
        // Reassign EventSports from dup to keep
        for (const es of dup.eventSports) {
          // Check if the target EventSport (keep + same gender/age) already exists
          // For now just reassign sportId
          await prisma.eventSport.update({
            where: { id: es.id },
            data: { sportId: keep.id },
          });
        }
        // Deactivate dup (don't delete, preserve referential integrity for Team etc.)
        await prisma.sport.update({ where: { id: dup.id }, data: { ativo: false } });
        console.log(`    Merged: ${dup.id} -> ${keep.id}`);
      }
    }
  }

  // 2. Parse existing EventSports - fill gender, ageCategory, displayName
  const allEventSports = await prisma.eventSport.findMany({
    include: { sport: true },
  });
  console.log(`\nProcessing ${allEventSports.length} EventSports`);

  for (const es of allEventSports) {
    const cat = (es.sport.categoria || '').trim().toUpperCase();

    // Parse gender from categoria
    let gender = 'OPEN';
    if (cat.includes('MASCULINO') || cat === 'MASC') gender = 'MASCULINO';
    else if (cat.includes('FEMININO') || cat === 'FEM') gender = 'FEMININO';
    else if (cat.includes('MISTO')) gender = 'MISTO';

    // Parse ageCategory from categoria
    let ageCategory = 'LIVRE';
    if (cat.includes('SUB-14') || cat.includes('SUB_14') || cat.includes('SUB14')) ageCategory = 'SUB_14';
    else if (cat.includes('SUB-16') || cat.includes('SUB_16') || cat.includes('SUB16')) ageCategory = 'SUB_16';
    else if (cat.includes('SUB-18') || cat.includes('SUB_18') || cat.includes('SUB18')) ageCategory = 'SUB_18';
    else if (cat.includes('SUB-20') || cat.includes('SUB_20') || cat.includes('SUB20')) ageCategory = 'SUB_20';
    else if (cat.includes('VETERANO')) ageCategory = 'VETERANO';
    else if (cat.includes('MASTER')) ageCategory = 'MASTER';

    // Generate displayName
    const sportNome = es.sport.nome;
    const genderLabel = gender === 'OPEN' ? '' : gender === 'MASCULINO' ? 'Masculino' : gender === 'FEMININO' ? 'Feminino' : 'Misto';
    const ageLabel = ageCategory === 'LIVRE' ? '' : ageCategory === 'SUB_14' ? 'Sub-14' : ageCategory === 'SUB_16' ? 'Sub-16' : ageCategory === 'SUB_18' ? 'Sub-18' : ageCategory === 'SUB_20' ? 'Sub-20' : ageCategory === 'VETERANO' ? 'Veterano' : 'Master';

    const parts = [sportNome, genderLabel, ageLabel].filter(Boolean);
    const displayName = parts.join(' ');

    await prisma.eventSport.update({
      where: { id: es.id },
      data: { gender: gender, ageCategory: ageCategory, displayName },
    });
    console.log(`  ${es.id}: ${displayName} (gender=${gender}, age=${ageCategory})`);
  }

  console.log('\n=== Migration complete ===');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
