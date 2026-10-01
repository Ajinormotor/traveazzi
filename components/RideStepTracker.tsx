import { Text, View } from 'react-native'
import className from 'twrnc'
import Ionicons from '@expo/vector-icons/Ionicons'

export type RideStep = {
  key: string
  label: string
  detail?: string | null
  done: boolean
}

type Props = {
  steps: RideStep[]
}

/**
 * Vertical ride tracker, lifted out of the driver Manage Ride screen so the
 * passenger screen renders the exact same component. Colours match the app:
 * #00B964 for a reached step, #ECECEC for the connector, #AAAAAA for pending.
 */
const RideStepTracker = ({ steps }: Props) => {
  const activeStep = steps.findIndex((step) => !step.done);

  return (
    <View style={className`flex flex-row gap-2 bg-[#FAFAFA] rounded-[6px] px-3 py-3`}>
      <View style={className`flex flex-col items-center`}>
        {steps.map((step, i) => {
          const reached = step.done;
          const isActive = i === activeStep;
          const isLast = i === steps.length - 1;

          return (
            <View key={step.key} style={className`flex flex-col items-center`}>
              <View
                style={[
                  className`w-[22px] h-[22px] rounded-full items-center justify-center border-[2px]`,
                  reached
                    ? className`bg-[#00B964] border-[#00B964]`
                    : isActive
                    ? className`bg-white border-[#00B964]`
                    : className`bg-white border-[#D3D3D3]`,
                ]}
              >
                {reached ? (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                ) : isActive ? (
                  <View className='w-[8px] h-[8px] rounded-full bg-[#00B964]' />
                ) : null}
              </View>

              {!isLast && (
                <View
                  style={[
                    className`w-[2px] h-[26px]`,
                    steps[i + 1].done || i + 1 === activeStep
                      ? className`bg-[#00B964]`
                      : className`bg-[#ECECEC]`,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={className`flex-1 gap-[14px]`}>
        {steps.map((step) => (
          <View key={step.key} style={className`flex flex-col`}>
            <Text
              numberOfLines={1}
              style={className`text-[14px] font-bold ${
                step.done ? 'text-[#000000]' : 'text-[#AAAAAA]'
              }`}
            >
              {step.label}
            </Text>
            {step.detail ? (
              <Text
                numberOfLines={1}
                style={className`text-[12px] text-[#AAAAAA] mt-[2px]`}
              >
                {step.detail}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default RideStepTracker
