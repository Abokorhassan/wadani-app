import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import {
  ErrorState,
  IconTile,
  Screen,
  ScreenHeader,
  SegmentedTabs,
  Skeleton,
  Text,
  useTheme,
} from '@/design-system';
import {
  callNumber,
  openMap,
  openWhatsApp,
  sendEmail,
  useContactInfo,
  useFaqs,
  type FaqItem,
} from '@/features/support';

type Tab = 'contact' | 'faqs';

export default function ContactScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('contact');
  const contact = useContactInfo();
  const faqs = useFaqs();

  return (
    <Screen>
      <ScreenHeader back title={t('contact.title')} subtitle={t('contact.subtitle')} />

      <View style={{ marginTop: theme.spacing.gutter }}>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'contact', label: t('contact.tabContact'), icon: Phone },
            { key: 'faqs', label: t('contact.tabFaqs'), icon: CircleHelp },
          ]}
        />
      </View>

      {tab === 'contact' ? (
        <View style={{ marginTop: theme.spacing.gutter, gap: 14 }}>
          {contact.isPending ? (
            <>
              <Skeleton height={88} radius={theme.radius.hero} />
              <Skeleton height={288} radius={theme.radius.card} />
            </>
          ) : contact.isError || !contact.data ? (
            <ErrorState
              message={t('contact.contactFailed')}
              onRetry={() => void contact.refetch()}
              retryLabel={t('common.retry')}
            />
          ) : (
            <>
              <Pressable
                onPress={() =>
                  void openWhatsApp(contact.data.whatsappNumber, t('contact.whatsappMessage'))
                }
                accessibilityRole="button"
                accessibilityLabel={t('contact.whatsappTitle')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 18,
                  borderRadius: theme.radius.hero,
                  backgroundColor: theme.color.whatsapp,
                  opacity: pressed ? 0.9 : 1,
                })}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme.radius.pill,
                    backgroundColor: 'rgba(26, 21, 18, 0.12)',
                  }}>
                  <MessageCircle size={24} color={theme.color.text} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="heading">{t('contact.whatsappTitle')}</Text>
                  <Text
                    variant="small"
                    color="textOnWhatsappSoft"
                    style={{ fontFamily: theme.fonts.text600 }}>
                    {contact.data.phone}
                  </Text>
                </View>
                <ArrowRight size={22} color={theme.color.text} />
              </Pressable>

              <View
                style={{
                  borderRadius: theme.radius.card,
                  borderWidth: 1,
                  borderColor: theme.color.border,
                  backgroundColor: theme.color.surface,
                }}>
                <ContactRow
                  icon={Phone}
                  label={t('contact.phone')}
                  value={contact.data.phone}
                  onPress={() => void callNumber(contact.data.phone)}
                />
                <ContactRow
                  icon={Mail}
                  label={t('contact.email')}
                  value={contact.data.email}
                  onPress={() => void sendEmail(contact.data.email)}
                />
                <ContactRow
                  icon={MapPin}
                  label={t('contact.office')}
                  value={contact.data.officeName}
                  onPress={() => void openMap(contact.data.officeName)}
                />
                <ContactRow
                  icon={Clock}
                  label={t('contact.hours')}
                  value={contact.data.officeHours}
                  last
                />
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={{ marginTop: theme.spacing.gutter }}>
          {faqs.isPending ? (
            <Skeleton height={320} radius={theme.radius.card} />
          ) : faqs.isError || !faqs.data ? (
            <ErrorState
              message={t('contact.faqsFailed')}
              onRetry={() => void faqs.refetch()}
              retryLabel={t('common.retry')}
            />
          ) : (
            <View
              style={{
                borderRadius: theme.radius.card,
                borderWidth: 1,
                borderColor: theme.color.border,
                backgroundColor: theme.color.surface,
              }}>
              {faqs.data.map((item, index) => (
                <FaqRow
                  key={item.id}
                  item={item}
                  initiallyOpen={index === 0}
                  last={index === faqs.data.length - 1}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
  last = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const theme = useTheme();

  const content = (
    <>
      <IconTile icon={icon} tone="neutral" size={42} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
        <Text variant="smallStrong">{value}</Text>
      </View>
      {onPress ? <ChevronRight size={20} color={theme.color.textMuted} /> : null}
    </>
  );

  const style = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: theme.color.border,
  };

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [style, pressed && { backgroundColor: theme.color.surfaceSunken }]}>
      {content}
    </Pressable>
  );
}

function FaqRow({
  item,
  initiallyOpen,
  last,
}: {
  item: FaqItem;
  initiallyOpen: boolean;
  last: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <Pressable
      onPress={() => setOpen((value) => !value)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={item.question}
      style={({ pressed }) => ({
        gap: 10,
        padding: 18,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.color.border,
        backgroundColor: pressed ? theme.color.surfaceSunken : 'transparent',
      })}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <Text variant="bodyStrong" style={{ flex: 1, lineHeight: 22 }}>
          {item.question}
        </Text>
        <Chevron size={20} color={open ? theme.color.text : theme.color.textMuted} />
      </View>
      {open ? (
        <Text variant="subtitle" color="textSecondary" style={{ lineHeight: 23 }}>
          {item.answer}
        </Text>
      ) : null}
    </Pressable>
  );
}
