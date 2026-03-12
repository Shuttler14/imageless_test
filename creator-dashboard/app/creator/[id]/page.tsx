import CreatorProfile from '@/components/CreatorProfile';

export default function CreatorProfilePage({ params }: { params: { id: string } }) {
  return <CreatorProfile creatorId={params.id} />;
}