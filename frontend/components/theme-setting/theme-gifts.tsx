import classes from "./theme-gifts.module.css";
import Image from "next/image";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Flex,
  Group,
  Stack,
  UnstyledButton,
  Input,
  NumberInput,
  Switch,
  Select,
  Collapse,
} from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";
import { AddFileButton } from "../common/add-file-button/add-file-button";

export interface Gift_t {
  id: string;
  file: File[];
  themeName: string;
  itemName: string;
}

export interface GiftSetting_t {
  id: string;
  heartRate: number;
  itemTotalNumber: number;
  isRandom: boolean;
  isSameTheme: boolean;
  themeType: "일반" | "VIP" | "럭" | "현질";
  rarity: "슈레" | "레어" | "노멀";
  children: Gift_t[];
}

interface GiftSettingHandle {
  getData: () => GiftSetting_t;
}

interface GiftHandle {
  getData: () => Gift_t;
}

export const ThemeGifts = forwardRef((props, ref) => {
  const [opened, { toggle }] = useDisclosure(false);

  const [settingIds, setSettingIds] = useState<string[]>([]);
  const settingRefs = useRef<{ [key: string]: GiftSettingHandle | null }>({});

  const addSetting = () =>
    setSettingIds((prev) => [...prev, crypto.randomUUID()]);

  useImperativeHandle(ref, () => ({
    getAllData: () =>
      settingIds.map((sid) => settingRefs.current[sid]?.getData()),
  }));

  return (
    <div style={{ position: "relative" }}>
      {/* 선물 세팅 추가 버튼 */}
      <UnstyledButton
        className={classes.AddGiftSettingButton}
        w={28}
        h={28}
        onClick={addSetting}
      >
        <Image
          src="/images/theme-setting/add-gift.svg"
          alt=""
          width={28}
          height={28}
        />
      </UnstyledButton>

      <UnstyledButton className={classes.Button} onClick={toggle}>
        <p>선물 목록 관리</p>
      </UnstyledButton>

      <Collapse pb={`${settingIds.length == 0 ? 0 : 12}`} in={opened}>
        <Stack gap={10}>
          {settingIds.map((sid) => (
            <GiftSetting
              key={sid}
              id={sid}
              onDelete={() => {
                delete settingRefs.current[sid];
                setSettingIds((prev) => prev.filter((id) => id !== sid));
              }}
              ref={(el) => {
                settingRefs.current[sid] = el as GiftSettingHandle;
              }}
            />
          ))}
        </Stack>
      </Collapse>
    </div>
  );
});

export const GiftSetting = forwardRef(
  ({ id, onDelete }: { id: string; onDelete: () => void }, ref) => {
    const [heartRate, setHeartRate] = useState<string | number>("");
    const [itemTotalNumber, setItemTotalNumber] = useState<string | number>("");

    const [isRandom, setIsRandom] = useState(false);
    const [isSameTheme, setSameTheme] = useState(false);

    const [themeType, setThemeType] = useState<string | null>("일반");
    const [rarity, setRarity] = useState<string | null>("슈레");

    const [giftIds, setGiftIds] = useState<string[]>([]);
    const giftRefs = useRef<{ [key: string]: GiftHandle | null }>({});

    const addGift = () => setGiftIds((prev) => [...prev, crypto.randomUUID()]);

    useImperativeHandle(ref, () => ({
      getData: () => ({
        id,
        heartRate: heartRate === "" ? 0 : Number(heartRate),
        itemTotalNumber: itemTotalNumber === "" ? 0 : Number(itemTotalNumber),
        isRandom,
        isSameTheme,
        themeType: themeType as GiftSetting_t["themeType"],
        rarity: rarity as GiftSetting_t["rarity"],
        children: giftIds
          .map((gid) => giftRefs.current[gid]?.getData())
          .filter((data): data is Gift_t => data !== undefined),
      }),
    }));

    return (
      <div className={classes.GiftSettingWrapper}>
        {/* 선물 세팅 삭제 버튼 */}
        <UnstyledButton
          className={classes.DeleteGiftSettingButton}
          w={28}
          h={28}
          onClick={onDelete}
        >
          <Image
            src="/images/theme-setting/delete-gift.svg"
            alt=""
            width={28}
            height={28}
          />
        </UnstyledButton>

        <Stack gap={12}>
          {/* 하트 레이팅 / 총 아이템 개수 */}
          <Group justify="space-between" pr={40}>
            {/* 하트 레이팅 / 하트 레이트 입력 */}
            <Group gap={8}>
              <HeartRating
                value={typeof heartRate === "string" ? 0.0 : heartRate}
                unitW={25}
                unitH={22}
              />
              <NumberInput
                classNames={{ input: classes.NumberInput }}
                value={heartRate}
                onChange={setHeartRate}
                defaultValue={0.0}
                max={5}
                min={0}
                decimalScale={2}
                fixedDecimalScale
                hideControls
              />
            </Group>

            {/* 총 아이템 개수 */}
            <Group align="center" gap={8}>
              <NumberInput
                classNames={{ input: classes.NumberInput }}
                value={itemTotalNumber}
                onChange={setItemTotalNumber}
                defaultValue={0}
                min={0}
                decimalScale={0}
                fixedDecimalScale
                hideControls
              />
              <p>개</p>
            </Group>
          </Group>

          {/* 선물 */}
          {giftIds.map((gid) => (
            <Gift
              key={gid}
              onDelete={() => {
                delete giftRefs.current[gid];
                setGiftIds((prev) => prev.filter((id) => id !== gid));
              }}
              ref={(el) => {
                giftRefs.current[gid] = el as GiftHandle;
              }}
            />
          ))}

          {/* 선물 추가 버튼 / 선물 세팅들 */}
          <Group justify="flex-start" gap={8} mih={80} wrap="nowrap">
            {/* 선물 추가 버튼 */}
            <Flex align="center" justify="center" w={125} miw={125}>
              <UnstyledButton w={20} h={20} onClick={addGift}>
                <Image
                  src="/images/theme-setting/add-gift.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </UnstyledButton>
            </Flex>

            {/* 선물 세팅들 */}
            <Stack gap={8}>
              {/* 랜덤 아이템 여부 */}
              <Switch
                classNames={{
                  body: classes.SwitchBody,
                }}
                styles={{
                  track: {
                    backgroundColor: `${
                      isRandom ? "var(--blue)" : "var(--gray-f2)"
                    }`,
                  },
                }}
                label="랜덤 아이템"
                checked={isRandom}
                onChange={(event) => setIsRandom(event.currentTarget.checked)}
                withThumbIndicator={false}
              />

              {/* 동일 테마 아이템 여부 / 테마 타입 / 희귀도 */}
              {isRandom && (
                <>
                  <Switch
                    classNames={{
                      body: classes.SwitchBody,
                    }}
                    styles={{
                      track: {
                        backgroundColor: `${
                          isSameTheme ? "var(--blue)" : "var(--gray-f2)"
                        }`,
                      },
                    }}
                    label="동일 테마 아이템"
                    checked={isSameTheme}
                    onChange={(event) =>
                      setSameTheme(event.currentTarget.checked)
                    }
                    withThumbIndicator={false}
                  />
                  <Group gap={8}>
                    <Select
                      classNames={{ input: classes.SelectInput }}
                      data={["일반", "VIP", "럭", "현질"]}
                      value={themeType}
                      onChange={setThemeType}
                      rightSection={null}
                    />
                    <Select
                      classNames={{ input: classes.SelectInput }}
                      data={["슈레", "레어", "노멀"]}
                      value={rarity}
                      onChange={setRarity}
                      rightSection={null}
                    />
                  </Group>
                </>
              )}
            </Stack>
          </Group>
        </Stack>
      </div>
    );
  }
);

const Gift = forwardRef(({ onDelete }: { onDelete: () => void }, ref) => {
  const [file, setFile] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  useEffect(() => {
    const urls = file.map((file) => URL.createObjectURL(file));
    setPreview(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [file]);

  const [themeName, setThemeName] = useState("");
  const [itemName, setItemName] = useState("");

  useImperativeHandle(ref, () => ({
    getData: () => ({ file, themeName, itemName }),
  }));

  return (
    <Group align="center" gap={8} h={80}>
      <Flex align="center" justify="center" w={125}>
        {file.length === 0 || !preview[0] ? (
          <AddFileButton
            icon="/images/add-file-button/add-file.svg"
            size={28}
            fileRatio="1:1"
            setFiles={setFile}
          />
        ) : (
          <div className={classes.GiftImageWrapper}>
            {/* 선물 삭제 버튼 */}
            <UnstyledButton
              className={classes.DeleteGiftButton}
              w={20}
              h={20}
              onClick={onDelete}
            >
              <Image
                src="/images/theme-setting/delete-gift.svg"
                alt=""
                width={20}
                height={20}
              />
            </UnstyledButton>
            <Image src={preview[0]} alt="" width={80} height={80} />
          </div>
        )}
      </Flex>

      {/* 테마 이름 / 아이템 이름 */}
      <Stack gap={0} style={{ flex: 1 }}>
        <Input
          classNames={{ input: classes.GiftInput }}
          styles={{ wrapper: { height: "28px" } }}
          variant="unstyled"
          placeholder="테마 이름"
          value={themeName}
          onChange={(event) => setThemeName(event.currentTarget.value)}
        />
        <Input
          classNames={{ input: classes.GiftInput }}
          variant="unstyled"
          placeholder="아이템 이름"
          value={itemName}
          onChange={(event) => setItemName(event.currentTarget.value)}
        />
      </Stack>
    </Group>
  );
});
