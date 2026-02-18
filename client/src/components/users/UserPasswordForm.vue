<script lang="ts" setup>
import { useVuelidate } from '@vuelidate/core'
import { helpers, minLength, required } from '@vuelidate/validators'

export interface UserPasswordFormProps {
  disabled?: boolean
}

const props = withDefaults(defineProps<UserPasswordFormProps>(), {
  disabled: false,
})

const { t } = useI18n()

const password = ref('')
const confirmPassword = ref('')

const passwordFocused = ref(false)

const rules = computed(() => {
  const messageRequired = helpers.withMessage(t('validation.required'), required)
  const messageMinLength = helpers.withMessage(t('validation.min', { n: 8 }), minLength(8))
  const messageMatch = helpers.withMessage(
    t('validation.passwords-dont-match'),
    (value: string) => value === password.value,
  )

  return {
    password: { messageRequired, messageMinLength },
    confirmPassword: { messageRequired, messageMatch },
  }
})

const v$ = useVuelidate(rules, { password, confirmPassword })

function reset() {
  password.value = ''
  confirmPassword.value = ''
  v$.value.$reset()
}

defineExpose({ v$, password, reset })
</script>

<template>
  <fieldset class="space-y-4" :disabled="disabled">
    <div class="space-y-2">
      <TextInput
        id="new-password"
        v-model="password"
        type="password"
        required
        auto-complete="new-password"
        :label-text="$t('common-fields.new-password')"
        :placeholder="$t('common-placeholders.password')"
        :invalid="v$.password.$error"
        :errors="v$.password.$errors"
        @focus="passwordFocused = true"
        @blur="passwordFocused = false; v$.password.$touch()"
      >
        <template #footer>
          <FadeTransition>
            <PasswordStrength
              v-if="password.length > 0 || passwordFocused"
              class="mt-2"
              :minimum-length="8"
              :password="password"
            />
          </FadeTransition>
        </template>
      </TextInput>

      <TextInput
        id="confirm-password"
        v-model="confirmPassword"
        type="password"
        required
        auto-complete="new-password"
        :label-text="$t('common-fields.confirm-password')"
        :placeholder="$t('common-placeholders.password')"
        :invalid="v$.confirmPassword.$error"
        :errors="v$.confirmPassword.$errors"
        @blur="v$.confirmPassword.$touch()"
      />
    </div>
  </fieldset>
</template>
