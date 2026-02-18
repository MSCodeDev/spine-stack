<script lang="ts" setup>
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid'
import type { ContributorRoleUpdate } from '@/types/spinestack-contributor-role'

const { t } = useI18n()
const router = useRouter()
const contributorRoleId = useRouteParams<string | undefined>('id', undefined)
const notificator = useToaster()

const { mutate: deleteContributorRole, isLoading: isDeleting, isSuccess: isDeleted } = useDeleteContributorRoleMutation()
const { mutate: editContributorRole, isLoading: isEditing } = useUpdateContributorRoleMutation()

const { data: contributorRole, isLoading } = useContributorRoleQuery({
  contributorRoleId: contributorRoleId as Ref<string>,
  includes: ['library'],
  enabled: computed(() => !!contributorRoleId.value && !isDeleting.value && !isDeleted.value),
  onError: async (error) => {
    await notificator.failure({
      title: t('contributor-roles.fetch-one-failure'),
      body: error.message,
    })
  },
})

function handleDelete() {
  deleteContributorRole(contributorRoleId.value!, {
    onSuccess: async () => {
      notificator.success({ title: t('contributor-roles.deleted-with-success') })
      await router.replace({ name: 'contributor-roles' })
    },
    onError: async (error) => {
      await notificator.failure({
        title: t('contributor-roles.deleted-with-failure'),
        body: error.message,
      })
    },
  })
}

const showDeleteDialog = ref(false)
const showEditDialog = ref(false)

function handleEditContributorRole(contributorRole: ContributorRoleUpdate) {
  editContributorRole(contributorRole, {
    onSuccess: async () => {
      await notificator.success({ title: t('contributor-roles.edited-with-success') })
    },
    onError: async (error) => {
      await notificator.failure({
        title: t('contributor-roles.edited-with-failure'),
        body: error.message,
      })
    },
  })
}
</script>

<template>
  <div>
    <Header
      :title="contributorRole?.attributes.name ?? ''"
      :loading="isLoading"
      class="mb-3 md:mb-0"
    >
      <template #actions>
        <Toolbar class="flex space-x-2">
          <Button
            class="w-11 h-11"
            :loading="isEditing"
            :disabled="isDeleting"
            :title="$t('common-actions.edit')"
            @click="showEditDialog = true"
          >
            <span class="sr-only">{{ $t('common-actions.edit') }}</span>
            <PencilIcon class="w-6 h-6" />
          </Button>

          <Button
            class="w-11 h-11"
            kind="danger"
            :disabled="isEditing"
            :loading="isDeleting"
            :title="$t('common-actions.delete')"
            @click="showDeleteDialog = true"
          >
            <span class="sr-only">{{ $t('common-actions.delete') }}</span>
            <TrashIcon class="w-6 h-6" />
          </Button>
        </Toolbar>
      </template>
    </Header>
    <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-10">
      <BlockMarkdown
        :loading="isLoading"
        :markdown="contributorRole?.attributes?.description"
        :title="$t('common-fields.description')"
      />
    </div>

    <ContributorRoleEditDialog
      v-if="contributorRole"
      :is-open="showEditDialog"
      :contributor-role-entity="contributorRole"
      @submit="handleEditContributorRole"
      @close="showEditDialog = false"
    />

    <ConfirmationDialog
      :is-open="showDeleteDialog"
      :title="$t('confirmation-dialog.delete-title', [$t('entities.contributor-role')])"
      :confirm-text="$t('common-actions.delete')"
      :loading="isDeleting"
      @close="showDeleteDialog = false"
      @confirm="handleDelete"
    >
      {{ $t('confirmation-dialog.delete-body', [$t('entities.contributor-role').toLowerCase()]) }}
    </ConfirmationDialog>
  </div>
</template>

<route lang="yaml">
meta:
  layout: dashboard
</route>
