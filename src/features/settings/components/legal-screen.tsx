import { useRouter } from 'expo-router';
import { ChevronRight, Mail, MessageCircle, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { IconTile, Screen, ScreenHeader, Text, useTheme } from '@/design-system';
import { openWhatsApp, sendEmail } from '@/features/support';
import { formatDate } from '@/lib/format';

import { LEGAL_CONTACT, LEGAL_PAGES, LEGAL_UPDATED, type LegalPage } from '../legal-links';

/** One piece of a section: a paragraph, a list, or the party's contact details. */
interface Block {
  p?: string;
  li?: string[];
  contact?: string;
}

interface LegalContent {
  title: string;
  intro: string;
  sections: { title: string; blocks: Block[] }[];
}

/**
 * The privacy policy, membership terms and account-deletion steps, read inside
 * the app. The same pages live on the website for the Google Play listing
 * (platform web app, src/routes/LegalPages.tsx); keep the two in step.
 */
export function LegalScreen({ page }: { page: LegalPage }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const content = t(`legal.${page}`, { returnObjects: true }) as LegalContent;

  return (
    <Screen>
      <ScreenHeader
        back
        title={content.title}
        subtitle={t('legal.updated', { date: formatDate(LEGAL_UPDATED) })}
      />

      <Text variant="body" color="textSecondary" style={{ marginTop: theme.spacing.gutter }}>
        {content.intro}
      </Text>

      <View style={{ gap: theme.spacing.xl, marginTop: theme.spacing.xl }}>
        {content.sections.map((section) => (
          <View key={section.title} style={{ gap: theme.spacing.md }}>
            <Text variant="heading" accessibilityRole="header">
              {section.title}
            </Text>
            {section.blocks.map((block, index) => (
              <BlockView key={index} block={block} />
            ))}
          </View>
        ))}
      </View>

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xxl }}>
        <Text variant="overline" color="textMuted">
          {t('legal.seeAlso')}
        </Text>
        {LEGAL_PAGES.filter((other) => other !== page).map((other) => (
          <Pressable
            key={other}
            onPress={() => router.replace({ pathname: '/legal/[page]', params: { page: other } })}
            accessibilityRole="link"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 48,
              opacity: pressed ? 0.6 : 1,
            })}>
            <Text variant="bodyStrong" color="actionDeep">
              {t(`legal.${other}.title`)}
            </Text>
            <ChevronRight size={18} color={theme.color.actionDeep} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function BlockView({ block }: { block: Block }) {
  const theme = useTheme();

  if (block.contact) return <ContactRows />;

  if (block.li) {
    return (
      <View style={{ gap: theme.spacing.sm }}>
        {block.li.map((item) => (
          <View key={item} style={{ flexDirection: 'row', gap: 10 }}>
            <View
              style={{
                width: 6,
                height: 6,
                marginTop: 9,
                borderRadius: 3,
                backgroundColor: theme.color.brandDeep,
              }}
            />
            <Text variant="subtitle" color="textSecondary" style={{ flex: 1 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Text variant="subtitle" color="textSecondary">
      {block.p}
    </Text>
  );
}

function ContactRows() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        borderRadius: theme.radius.card,
        borderWidth: 1,
        borderColor: theme.color.border,
        backgroundColor: theme.color.surface,
        overflow: 'hidden',
      }}>
      <ContactRow
        icon={Mail}
        label={t('legal.contactEmail')}
        value={LEGAL_CONTACT.email}
        onPress={() => void sendEmail(LEGAL_CONTACT.email)}
      />
      <View style={{ height: 1, marginLeft: 70, backgroundColor: theme.color.border }} />
      <ContactRow
        icon={MessageCircle}
        label={t('legal.contactWhatsApp')}
        value={LEGAL_CONTACT.whatsapp}
        onPress={() => void openWhatsApp(LEGAL_CONTACT.whatsapp, '')}
      />
    </View>
  );
}

function ContactRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`${label}, ${value}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        opacity: pressed ? 0.6 : 1,
      })}>
      <IconTile icon={icon} tone="brand" size={40} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
        <Text variant="bodyStrong">{value}</Text>
      </View>
    </Pressable>
  );
}
